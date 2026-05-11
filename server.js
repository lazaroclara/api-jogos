const express = require('express');
const app = express();

const postLogin = require('./routes/postLogin');
const jogos = require('./routes/jogos');

app.use(express.json());

app.use('/', postLogin);

app.use('/', jogos);

app.get('/', (req, res) => {
    res.send('API funcionando');
});

app.listen(3000, () => {
    console.log('Servidor rodando');
});