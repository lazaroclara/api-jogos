const express = require('express');
const router = express.Router();

const db = require('../database/database');

const NOTA_MINIMA = 0;
const NOTA_MAXIMA = 10;
const LIMITE_PADRAO = 10;
const LIMITE_MAXIMO = 50;

const camposObrigatorios = ['nome', 'tipo', 'nota', 'review'];

function criarErro(status, mensagem) {
    const erro = new Error(mensagem);
    erro.status = status;
    return erro;
}

function validarId(id) {
    if (!id || !/^\d+$/.test(String(id))) {
        return {
            valido: false,
            mensagem: 'O id deve ser um número inteiro positivo.'
        };
    }

    const numero = Number(id);

    if (!Number.isInteger(numero) || numero <= 0) {
        return {
            valido: false,
            mensagem: 'O id deve ser um número inteiro positivo.'
        };
    }

    return {
        valido: true,
        valor: numero
    };
}

function validarTexto(valor, campo) {
    if (typeof valor !== 'string') {
        return `${campo} deve ser um texto.`;
    }

    if (valor.trim().length === 0) {
        return `${campo} não pode ser vazio.`;
    }

    if (valor.trim().length > 255) {
        return `${campo} deve possuir no máximo 255 caracteres.`;
    }

    return null;
}

function validarReview(valor) {
    if (typeof valor !== 'string') {
        return 'review deve ser um texto.';
    }

    if (valor.trim().length === 0) {
        return 'review não pode ser vazia.';
    }

    if (valor.trim().length > 1000) {
        return 'review deve possuir no máximo 1000 caracteres.';
    }

    return null;
}

function validarNota(nota) {
    if (nota === undefined || nota === null || nota === '') {
        return 'nota é obrigatória.';
    }

    const numero = Number(nota);

    if (!Number.isInteger(numero)) {
        return 'nota deve ser um número inteiro.';
    }

    if (numero < NOTA_MINIMA || numero > NOTA_MAXIMA) {
        return `nota deve estar entre ${NOTA_MINIMA} e ${NOTA_MAXIMA}.`;
    }

    return null;
}

function validarJogo(dados) {
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
        return ['O corpo da requisição deve ser um objeto.'];
    }

    const erros = [];

    camposObrigatorios.forEach((campo) => {
        if (
            dados[campo] === undefined ||
            dados[campo] === null
        ) {
            erros.push(`${campo} é obrigatório.`);
        }
    });

    if (dados.nome !== undefined && dados.nome !== null) {
        const erroNome = validarTexto(dados.nome, 'nome');

        if (erroNome) {
            erros.push(erroNome);
        }
    }

    if (dados.tipo !== undefined && dados.tipo !== null) {
        const erroTipo = validarTexto(dados.tipo, 'tipo');

        if (erroTipo) {
            erros.push(erroTipo);
        }
    }

    if (dados.nota !== undefined && dados.nota !== null) {
        const erroNota = validarNota(dados.nota);

        if (erroNota) {
            erros.push(erroNota);
        }
    }

    if (dados.review !== undefined && dados.review !== null) {
        const erroReview = validarReview(dados.review);

        if (erroReview) {
            erros.push(erroReview);
        }
    }

    return erros;
}

function normalizarJogo(dados) {
    return {
        nome: dados.nome.trim(),
        tipo: dados.tipo.trim(),
        nota: Number(dados.nota),
        review: dados.review.trim()
    };
}

function obterPaginacao(query) {
    const paginaInformada = Number.parseInt(query.page, 10);
    const limiteInformado = Number.parseInt(query.limit, 10);

    const pagina = Number.isInteger(paginaInformada) && paginaInformada > 0
        ? paginaInformada
        : 1;

    let limite = Number.isInteger(limiteInformado) && limiteInformado > 0
        ? limiteInformado
        : LIMITE_PADRAO;

    if (limite > LIMITE_MAXIMO) {
        limite = LIMITE_MAXIMO;
    }

    const offset = (pagina - 1) * limite;

    return {
        pagina,
        limite,
        offset
    };
}

function obterOrdenacao(valor) {
    const ordenacoesPermitidas = {
        id: 'id',
        nome: 'nome',
        tipo: 'tipo',
        nota: 'nota'
    };

    const campo = String(valor || 'id').toLowerCase();

    return ordenacoesPermitidas[campo] || ordenacoesPermitidas.id;
}

function obterDirecao(valor) {
    const direcao = String(valor || 'asc').toLowerCase();

    if (direcao === 'desc') {
        return 'DESC';
    }

    return 'ASC';
}

function responderErro(res, erro, mensagemPadrao) {
    console.error(erro);

    const status = erro.status || 500;

    return res.status(status).json({
        sucesso: false,
        mensagem: erro.status ? erro.message : mensagemPadrao
    });
}

router.get('/jogos', async (req, res) => {
    try {
        const { page, limit, offset } = obterPaginacao(req.query);
        const campoOrdenacao = obterOrdenacao(req.query.sort);
        const direcao = obterDirecao(req.query.order);

        const busca = typeof req.query.search === 'string'
            ? req.query.search.trim()
            : '';

        const tipo = typeof req.query.tipo === 'string'
            ? req.query.tipo.trim()
            : '';

        const parametros = [];
        const filtros = [];

        if (busca) {
            parametros.push(`%${busca}%`);
            filtros.push(`nome ILIKE $${parametros.length}`);
        }

        if (tipo) {
            parametros.push(tipo);
            filtros.push(`tipo ILIKE $${parametros.length}`);
        }

        const where = filtros.length > 0
            ? `WHERE ${filtros.join(' AND ')}`
            : '';

        const countResult = await db.query(
            `SELECT COUNT(*) AS total
             FROM jogos
             ${where}`,
            parametros
        );

        parametros.push(limit);
        parametros.push(offset);

        const result = await db.query(
            `SELECT *
             FROM jogos
             ${where}
             ORDER BY ${campoOrdenacao} ${direcao}
             LIMIT $${parametros.length - 1}
             OFFSET $${parametros.length}`,
            parametros
        );

        const total = Number(countResult.rows[0].total);
        const totalPaginas = total === 0
            ? 0
            : Math.ceil(total / limit);

        return res.status(200).json({
            sucesso: true,
            dados: result.rows,
            paginacao: {
                pagina: page,
                limite: limit,
                total,
                totalPaginas
            }
        });
    } catch (err) {
        return responderErro(
            res,
            err,
            'Erro ao buscar jogos.'
        );
    }
});

router.get('/jogos/:id', async (req, res) => {
    const validacao = validarId(req.params.id);

    if (!validacao.valido) {
        return res.status(400).json({
            sucesso: false,
            mensagem: validacao.mensagem
        });
    }

    try {
        const result = await db.query(
            'SELECT * FROM jogos WHERE id = $1',
            [validacao.valor]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Jogo não encontrado.'
            });
        }

        return res.status(200).json({
            sucesso: true,
            dados: result.rows[0]
        });
    } catch (err) {
        return responderErro(
            res,
            err,
            'Erro ao buscar jogo.'
        );
    }
});

router.post('/jogos', async (req, res) => {
    const erros = validarJogo(req.body);

    if (erros.length > 0) {
        return res.status(400).json({
            sucesso: false,
            mensagem: 'Dados inválidos.',
            erros
        });
    }

    const jogo = normalizarJogo(req.body);

    try {
        const result = await db.query(
            `INSERT INTO jogos
                (nome, tipo, nota, review)
             VALUES
                ($1, $2, $3, $4)
             RETURNING *`,
            [
                jogo.nome,
                jogo.tipo,
                jogo.nota,
                jogo.review
            ]
        );

        return res.status(201).json({
            sucesso: true,
            mensagem: 'Jogo cadastrado com sucesso.',
            dados: result.rows[0]
        });
    } catch (err) {
        return responderErro(
            res,
            err,
            'Erro ao cadastrar jogo.'
        );
    }
});

router.put('/jogos/:id', async (req, res) => {
    const validacao = validarId(req.params.id);

    if (!validacao.valido) {
        return res.status(400).json({
            sucesso: false,
            mensagem: validacao.mensagem
        });
    }

    const erros = validarJogo(req.body);

    if (erros.length > 0) {
        return res.status(400).json({
            sucesso: false,
            mensagem: 'Dados inválidos.',
            erros
        });
    }

    const jogo = normalizarJogo(req.body);

    try {
        const result = await db.query(
            `UPDATE jogos
             SET nome = $1,
                 tipo = $2,
                 nota = $3,
                 review = $4
             WHERE id = $5
             RETURNING *`,
            [
                jogo.nome,
                jogo.tipo,
                jogo.nota,
                jogo.review,
                validacao.valor
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Jogo não encontrado.'
            });
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Jogo atualizado com sucesso.',
            dados: result.rows[0]
        });
    } catch (err) {
        return responderErro(
            res,
            err,
            'Erro ao atualizar jogo.'
        );
    }
});

router.delete('/jogos/:id', async (req, res) => {
    const validacao = validarId(req.params.id);

    if (!validacao.valido) {
        return res.status(400).json({
            sucesso: false,
            mensagem: validacao.mensagem
        });
    }

    try {
        const result = await db.query(
            `DELETE FROM jogos
             WHERE id = $1
             RETURNING id`,
            [validacao.valor]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Jogo não encontrado.'
            });
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Jogo deletado com sucesso.',
            id: result.rows[0].id
        });
    } catch (err) {
        return responderErro(
            res,
            err,
            'Erro ao deletar jogo.'
        );
    }
});

router.get('/jogos-estatisticas', async (req, res) => {
    try {
        const totalResult = await db.query(
            'SELECT COUNT(*) AS total FROM jogos'
        );

        const mediaResult = await db.query(
            'SELECT COALESCE(AVG(nota), 0) AS media FROM jogos'
        );

        const melhorResult = await db.query(
            `SELECT *
             FROM jogos
             ORDER BY nota DESC, nome ASC
             LIMIT 1`
        );

        const piorResult = await db.query(
            `SELECT *
             FROM jogos
             ORDER BY nota ASC, nome ASC
             LIMIT 1`
        );

        const tiposResult = await db.query(
            `SELECT tipo, COUNT(*) AS quantidade
             FROM jogos
             GROUP BY tipo
             ORDER BY quantidade DESC`
        );

        return res.status(200).json({
            sucesso: true,
            dados: {
                totalJogos: Number(totalResult.rows[0].total),
                mediaNotas: Number(
                    Number(mediaResult.rows[0].media).toFixed(2)
                ),
                melhorJogo: melhorResult.rows[0] || null,
                piorJogo: piorResult.rows[0] || null,
                jogosPorTipo: tiposResult.rows
            }
        });
    } catch (err) {
        return responderErro(
            res,
            err,
            'Erro ao gerar estatísticas dos jogos.'
        );
    }
});

router.get('/tipos', async (req, res) => {
    try {
        const result = await db.query(
            `SELECT DISTINCT tipo
             FROM jogos
             ORDER BY tipo ASC`
        );

        return res.status(200).json({
            sucesso: true,
            dados: result.rows.map((item) => item.tipo)
        });
    } catch (err) {
        return responderErro(
            res,
            err,
            'Erro ao buscar tipos de jogos.'
        );
    }
});

module.exports = router;