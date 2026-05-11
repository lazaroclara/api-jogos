const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.query(`
    CREATE TABLE IF NOT EXISTS jogos (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        tipo TEXT NOT NULL,
        nota INTEGER NOT NULL,
        review TEXT NOT NULL
    )
`, (err) => {
    if (err) {
        console.log('Erro ao criar tabela:', err);
    } else {
        console.log('Banco conectado');
    }
});

module.exports = pool;
