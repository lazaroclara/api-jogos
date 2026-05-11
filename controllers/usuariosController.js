exports.listar = (req, res) => {
    res.json([
        { id: 1, nome: 'Ana' },
        { id: 2, nome: 'Carlos' }
    ]);
};

exports.criar = (req, res) => {
    const usuario = req.body;

    res.json({
        mensagem: 'Usuário criado',
        usuario
    });
};