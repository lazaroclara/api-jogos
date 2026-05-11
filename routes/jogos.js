const express = require('express');
const router = express.Router();

const db = require('../database/database');


router.get('/jogos', (req, res) => {

    db.all('SELECT * FROM jogos', [], (err, rows) => {

        if (err) {
            return res.status(500).json({
                mensagem: 'Erro ao buscar jogos'
            });
        }

        res.status(200).json(rows);
    });
});


router.get('/jogos/:id', (req, res) => {

    const { id } = req.params;

    db.get(
        'SELECT * FROM jogos WHERE id = ?',
        [id],
        (err, row) => {

            if (err) {
                return res.status(500).json({
                    mensagem: 'Erro ao buscar jogo'
                });
            }

            if (!row) {
                return res.status(404).json({
                    mensagem: 'Jogo não encontrado!'
                });
            }

            res.status(200).json(row);
        }
    );
});


router.post('/jogos', (req, res) => {

    const { nome, tipo, nota, review } = req.body;

    db.run(
        `
        INSERT INTO jogos (nome, tipo, nota, review)
        VALUES (?, ?, ?, ?)
        `,
        [nome, tipo, nota, review],

        function (err) {

            if (err) {
                return res.status(500).json({
                    mensagem: 'Erro ao cadastrar jogo'
                });
            }

            res.status(201).json({
                id: this.lastID,
                nome,
                tipo,
                nota,
                review
            });
        }
    );
});


router.put('/jogos/:id', (req, res) => {

    const { id } = req.params;
    const { nome, tipo, nota, review } = req.body;

    db.run(
        `
        UPDATE jogos
        SET nome = ?, tipo = ?, nota = ?, review = ?
        WHERE id = ?
        `,
        [nome, tipo, nota, review, id],

        function (err) {

            if (err) {
                return res.status(500).json({
                    mensagem: 'Erro ao atualizar jogo'
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    mensagem: 'Jogo não encontrado!'
                });
            }

            res.status(200).json({
                id: parseInt(id),
                nome,
                tipo,
                nota,
                review
            });
        }
    );
});



router.delete('/jogos/:id', (req, res) => {

    const { id } = req.params;

    db.run(
        'DELETE FROM jogos WHERE id = ?',
        [id],

        function (err) {

            if (err) {
                return res.status(500).json({
                    mensagem: 'Erro ao deletar jogo'
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    mensagem: 'Jogo não encontrado!'
                });
            }

            res.status(204).send();
        }
    );
});

module.exports = router;