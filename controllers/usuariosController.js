const Usuario = require('../models/usuario');

const usuarios = [
    new Usuario(1, 'Ana', 'ana@esoft.com'),
    new Usuario(2, 'Carlos', 'carlos@esoft.com')
];

function validarNome(nome) {
    if (typeof nome !== 'string') {
        return 'nome deve ser um texto.';
    }

    if (nome.trim().length < 2) {
        return 'nome deve possuir pelo menos 2 caracteres.';
    }

    if (nome.trim().length > 100) {
        return 'nome deve possuir no máximo 100 caracteres.';
    }

    return null;
}

function validarEmail(email) {
    if (typeof email !== 'string') {
        return 'email deve ser um texto.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return 'email deve possuir um formato válido.';
    }

    return null;
}

function buscarPorId(id) {
    return usuarios.find((usuario) => usuario.id === id);
}

exports.listar = (req, res) => {
    return res.status(200).json({
        sucesso: true,
        dados: usuarios.map((usuario) => usuario.toJSON())
    });
};

exports.buscar = (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            sucesso: false,
            mensagem: 'O id deve ser um número inteiro positivo.'
        });
    }

    const usuario = buscarPorId(id);

    if (!usuario) {
        return res.status(404).json({
            sucesso: false,
            mensagem: 'Usuário não encontrado.'
        });
    }

    return res.status(200).json({
        sucesso: true,
        dados: usuario.toJSON()
    });
};

exports.criar = (req, res) => {
    const { nome, email } = req.body || {};

    const erros = [];

    const erroNome = validarNome(nome);
    const erroEmail = validarEmail(email);

    if (erroNome) {
        erros.push(erroNome);
    }

    if (erroEmail) {
        erros.push(erroEmail);
    }

    if (erros.length > 0) {
        return res.status(400).json({
            sucesso: false,
            mensagem: 'Dados inválidos.',
            erros
        });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const emailExiste = usuarios.some(
        (usuario) => usuario.email === emailNormalizado
    );

    if (emailExiste) {
        return res.status(409).json({
            sucesso: false,
            mensagem: 'Já existe um usuário com esse email.'
        });
    }

    const proximoId = usuarios.length > 0
        ? Math.max(...usuarios.map((usuario) => usuario.id)) + 1
        : 1;

    const usuario = new Usuario(
        proximoId,
        nome.trim(),
        emailNormalizado
    );

    usuarios.push(usuario);

    return res.status(201).json({
        sucesso: true,
        mensagem: 'Usuário criado com sucesso.',
        dados: usuario.toJSON()
    });
};

exports.atualizar = (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            sucesso: false,
            mensagem: 'O id deve ser um número inteiro positivo.'
        });
    }

    const usuario = buscarPorId(id);

    if (!usuario) {
        return res.status(404).json({
            sucesso: false,
            mensagem: 'Usuário não encontrado.'
        });
    }

    const { nome, email } = req.body || {};
    const erros = [];

    const erroNome = validarNome(nome);
    const erroEmail = validarEmail(email);

    if (erroNome) {
        erros.push(erroNome);
    }

    if (erroEmail) {
        erros.push(erroEmail);
    }

    if (erros.length > 0) {
        return res.status(400).json({
            sucesso: false,
            mensagem: 'Dados inválidos.',
            erros
        });
    }

    usuario.atualizar(
        nome.trim(),
        email.trim().toLowerCase()
    );

    return res.status(200).json({
        sucesso: true,
        mensagem: 'Usuário atualizado com sucesso.',
        dados: usuario.toJSON()
    });
};

exports.remover = (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            sucesso: false,
            mensagem: 'O id deve ser um número inteiro positivo.'
        });
    }

    const indice = usuarios.findIndex(
        (usuario) => usuario.id === id
    );

    if (indice === -1) {
        return res.status(404).json({
            sucesso: false,
            mensagem: 'Usuário não encontrado.'
        });
    }

    usuarios.splice(indice, 1);

    return res.status(200).json({
        sucesso: true,
        mensagem: 'Usuário removido com sucesso.'
    });
};