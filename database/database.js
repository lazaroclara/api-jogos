const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./banco.db', (err) => {
    if (err) {
        console.log('Erro ao conectar banco');
    } else {
        console.log('Banco conectado');
    }
});

db.run(`
    CREATE TABLE IF NOT EXISTS jogos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        tipo TEXT NOT NULL,
        nota INTEGER NOT NULL,
        review TEXT NOT NULL
    )
`);

module.exports = db;