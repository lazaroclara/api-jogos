const express = require('express');
const app = express();

const jogosRoutes = require('./routes/jogos');
const loginRoutes = require('./routes/postLogin');

app.use(express.json());

app.use('/', jogosRoutes);
app.use('/', loginRoutes);

app.get('/', (req, res) => {
    res.send('API funcionando');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`PORT env: ${process.env.PORT}`);
    console.log(`DATABASE_URL definida: ${!!process.env.DATABASE_URL}`);
});
