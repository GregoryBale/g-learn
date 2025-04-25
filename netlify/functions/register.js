const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

exports.handler = async (event) => {
    const { login, passwordHash } = JSON.parse(event.body);
    try {
        const client = await pool.connect();
        const result = await client.query(
            'INSERT INTO users (login, password_hash) VALUES ($1, $2) RETURNING id',
            [login, passwordHash]
        );
        await client.query(
            'INSERT INTO user_progress (user_id, progress) VALUES ($1, $2)',
            [result.rows[0].id, '{}']
        );
        await client.query(
            'INSERT INTO user_stats (user_id, points, streak, achievements, badges) VALUES ($1, $2, $3, $4, $5)',
            [result.rows[0].id, 0, 0, '[]', '[]']
        );
        client.release();
        return { statusCode: 200, body: JSON.stringify({ id: result.rows[0].id }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Ошибка регистрации' }) };
    }
};
