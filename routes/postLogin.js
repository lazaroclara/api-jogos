const express = require('express');
const router = express.Router();
const { randomUUID } = require('crypto');

router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (email === "usuario@esoft.com" && password === "Abc123") {
        return res.status(200).json({
            token: randomUUID()
        });
    }

    res.status(401).json({
        mensagem: "Credenciais inválidas!"
    });
});

module.exports = router;
