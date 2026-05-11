const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../banco.db');

const db = new sqlite3.Database(dbPath, (err) => {

    if (err) {
        console.log('Erro ao conectar banco');
        console.log(err);
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