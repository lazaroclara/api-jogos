const express = require('express');
const router = express.Router();

const db = require('../database/database');

router.get('/jogos', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM jogos');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ mensagem: 'Erro ao buscar jogos' });
    }
});

router.get('/jogos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM jogos WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Jogo não encontrado!' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ mensagem: 'Erro ao buscar jogo' });
    }
});

router.post('/jogos', async (req, res) => {
    const { nome, tipo, nota, review } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO jogos (nome, tipo, nota, review) VALUES ($1, $2, $3, $4) RETURNING *',
            [nome, tipo, nota, review]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ mensagem: 'Erro ao cadastrar jogo' });
    }
});

router.put('/jogos/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, tipo, nota, review } = req.body;
    try {
        const result = await db.query(
            'UPDATE jogos SET nome = $1, tipo = $2, nota = $3, review = $4 WHERE id = $5 RETURNING *',
            [nome, tipo, nota, review, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Jogo não encontrado!' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ mensagem: 'Erro ao atualizar jogo' });
    }
});

router.delete('/jogos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM jogos WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Jogo não encontrado!' });
        }
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ mensagem: 'Erro ao deletar jogo' });
    }
});

module.exports = router;
