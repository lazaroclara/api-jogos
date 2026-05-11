const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
    const {email, password} = req.body;
    if (email === "usuario@esoft.com" && password === "Abc123") {
        return res.status(200).json({
            mensagem: "Login bem-sucedido!"
        });
    }

    res.status(401).json({
        mensagem: "Credenciais inválidas!"
    }); 
});

module.exports = router;