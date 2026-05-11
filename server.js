const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const postLogin = require('./routes/postLogin');
const jogos = require('./routes/jogos');

app.use(express.json());

app.use('/', postLogin);

app.use('/', jogos);

app.get('/', (req, res) => {
    res.send('API funcionando');
});

app.listen(PORT, () => {
    console.log('Servidor rodando');
});