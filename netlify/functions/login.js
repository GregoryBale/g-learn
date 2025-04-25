const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

exports.handler = async (event) => {
    const { login, passwordHash } = JSON.parse(event.body);
    try {
        const client = await pool.connect();
        const result = await client.query(
            'SELECT id FROM users WHERE login = $1 AND password_hash = $2',
            [login, passwordHash]
        );
        client.release();
        if (result.rows.length > 0) {
            const token = jwt.sign({ userId: result.rows[0].id }, process.env.JWT_SECRET || 'your-secret-key');
            return { statusCode: 200, body: JSON.stringify({ token }) };
        } else {
            return { statusCode: 401, body: JSON.stringify({ error: 'Неверный логин или пароль' }) };
        }
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Ошибка входа' }) };
    }
};
