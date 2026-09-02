const express = require('express');
const cors = require('cors');

const app = express();

const jogosRoutes = require('./routes/jogos');
const loginModule = require('./routes/postLogin');
const usuariosController = require('./controllers/usuariosController');

const loginRoutes = loginModule.router;

app.use(cors());

app.use(express.json({ limit: '1mb' }));

app.use(express.urlencoded({
    extended: true,
    limit: '1mb'
}));

app.use((req, res, next) => {
    const inicio = Date.now();

    res.on('finish', () => {
        const duracao = Date.now() - inicio;

        console.log(
            `[${req.method}] ${req.originalUrl} - ` +
            `${res.statusCode} - ${duracao}ms`
        );
    });

    next();
});

app.get('/', (req, res) => {
    return res.status(200).json({
        sucesso: true,
        mensagem: 'API de jogos funcionando.',
        versao: '1.0.0'
    });
});

app.get('/health', (req, res) => {
    return res.status(200).json({
        sucesso: true,
        status: 'online',
        timestamp: new Date().toISOString()
    });
});

app.get('/usuarios', usuariosController.listar);

app.get('/usuarios/:id', usuariosController.buscar);

app.post('/usuarios', usuariosController.criar);

app.put('/usuarios/:id', usuariosController.atualizar);

app.delete('/usuarios/:id', usuariosController.remover);

app.use('/', jogosRoutes);

app.use('/', loginRoutes);

app.use((req, res) => {
    return res.status(404).json({
        sucesso: false,
        mensagem: 'Rota não encontrada.',
        metodo: req.method,
        caminho: req.originalUrl
    });
});

app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);

    if (res.headersSent) {
        return next(err);
    }

    return res.status(500).json({
        sucesso: false,
        mensagem: 'Ocorreu um erro interno no servidor.'
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log('=================================');
    console.log('       API DE JOGOS ONLINE       ');
    console.log('=================================');
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`PORT env: ${process.env.PORT}`);
    console.log(
        `DATABASE_URL definida: ${!!process.env.DATABASE_URL}`
    );
    console.log(
        `Ambiente: ${process.env.NODE_ENV || 'development'}`
    );
});