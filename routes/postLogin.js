const express = require('express');
const router = express.Router();
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (email === "usuario@esoft.com" && password === "Abc123") {
        return res.status(200).json({
            token: "550e8400-e29b-41d4-a716-446655440000"
        });
    }

    res.status(401).json({
        mensagem: "Credenciais inválidas!"
    });
});

module.exports = router;
