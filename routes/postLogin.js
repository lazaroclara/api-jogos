const express = require('express');
const crypto = require('crypto');

const router = express.Router();

const USUARIO_PADRAO = {
    email: 'usuario@esoft.com',
    password: 'Abc123'
};

const tokensAtivos = new Map();

function validarEmail(email) {
    if (typeof email !== 'string') {
        return false;
    }

    const emailNormalizado = email.trim();

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        emailNormalizado
    );
}

function validarSenha(password) {
    return (
        typeof password === 'string' &&
        password.length >= 4
    );
}

function gerarToken() {
    return crypto.randomUUID();
}

function criarRespostaToken(token) {
    return {
        sucesso: true,
        mensagem: 'Login realizado com sucesso.',
        token
    };
}

function removerTokenExpirado(token) {
    const dadosToken = tokensAtivos.get(token);

    if (!dadosToken) {
        return false;
    }

    if (dadosToken.expiraEm <= Date.now()) {
        tokensAtivos.delete(token);
        return false;
    }

    return true;
}

router.post('/login', (req, res) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({
            sucesso: false,
            mensagem: 'Email e senha são obrigatórios.'
        });
    }

    if (!validarEmail(email)) {
        return res.status(400).json({
            sucesso: false,
            mensagem: 'Informe um email válido.'
        });
    }

    if (!validarSenha(password)) {
        return res.status(400).json({
            sucesso: false,
            mensagem: 'A senha deve possuir pelo menos 4 caracteres.'
        });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const credenciaisValidas =
        emailNormalizado === USUARIO_PADRAO.email &&
        password === USUARIO_PADRAO.password;

    if (!credenciaisValidas) {
        return res.status(401).json({
            sucesso: false,
            mensagem: 'Credenciais inválidas.'
        });
    }

    const token = gerarToken();

    tokensAtivos.set(token, {
        email: emailNormalizado,
        criadoEm: Date.now(),
        expiraEm: Date.now() + 1000 * 60 * 60
    });

    return res.status(200).json(
        criarRespostaToken(token)
    );
});

router.post('/logout', (req, res) => {
    const header = req.headers.authorization;

    if (!header) {
        return res.status(400).json({
            sucesso: false,
            mensagem: 'Token não informado.'
        });
    }

    const partes = header.split(' ');

    if (partes.length !== 2 || partes[0] !== 'Bearer') {
        return res.status(400).json({
            sucesso: false,
            mensagem: 'Formato do token inválido.'
        });
    }

    const token = partes[1];

    tokensAtivos.delete(token);

    return res.status(200).json({
        sucesso: true,
        mensagem: 'Logout realizado com sucesso.'
    });
});

function autenticarToken(req, res, next) {
    const header = req.headers.authorization;

    if (!header) {
        return res.status(401).json({
            sucesso: false,
            mensagem: 'Token de autenticação não informado.'
        });
    }

    const partes = header.split(' ');

    if (partes.length !== 2 || partes[0] !== 'Bearer') {
        return res.status(401).json({
            sucesso: false,
            mensagem: 'Formato de autenticação inválido.'
        });
    }

    const token = partes[1];

    if (!removerTokenExpirado(token)) {
        return res.status(401).json({
            sucesso: false,
            mensagem: 'Token inválido ou expirado.'
        });
    }

    req.usuario = tokensAtivos.get(token);

    return next();
}

router.get('/sessao', autenticarToken, (req, res) => {
    return res.status(200).json({
        sucesso: true,
        autenticado: true,
        usuario: {
            email: req.usuario.email
        }
    });
});

module.exports = {
    router,
    autenticarToken,
    tokensAtivos
};