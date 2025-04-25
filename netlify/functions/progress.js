const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

exports.handler = async (event) => {
    const token = event.headers.authorization?.split(' ')[1];
    if (!token) return { statusCode: 401, body: JSON.stringify({ error: 'Неавторизован' }) };

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const userId = decoded.userId;

        if (event.httpMethod === 'GET') {
            const client = await pool.connect();
            const progressResult = await client.query(
                'SELECT progress FROM user_progress WHERE user_id = $1',
                [userId]
            );
            const statsResult = await client.query(
                'SELECT points, streak, achievements, badges FROM user_stats WHERE user_id = $1',
                [userId]
            );
            client.release();
            const progress = progressResult.rows[0]?.progress || {};
            const stats = statsResult.rows[0] || { points: 0, streak: 0, achievements: [], badges: [] };
            return { statusCode: 200, body: JSON.stringify({ ...progress, ...stats }) };
        } else if (event.httpMethod === 'POST') {
            const data = JSON.parse(event.body);
            const client = await pool.connect();
            await client.query(
                'INSERT INTO user_progress (user_id, progress) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET progress = $2',
                [userId, data.progress || {}]
            );
            await client.query(
                'INSERT INTO user_stats (user_id, points, streak, achievements, badges) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_id) DO UPDATE SET points = $2, streak = $3, achievements = $4, badges = $5',
                [userId, data.points || 0, data.streak || 0, data.achievements || '[]', data.badges || '[]']
            );
            client.release();
            return { statusCode: 200, body: JSON.stringify({ message: 'Прогресс сохранён' }) };
        }
    } catch (error) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Неавторизован или ошибка' }) };
    }
};
