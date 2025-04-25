const { db } = require('./db');
const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
    console.log('Progress request:', event); // Для отладки

    const token = event.headers.authorization?.split(' ')[1];
    if (!token) {
        return {
            statusCode: 401,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.stringify({ error: 'Неавторизован' })
        };
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        if (event.httpMethod === 'GET') {
            const progress = await db('user_progress').where({ user_id: userId }).select('progress').first();
            const stats = await db('user_stats').where({ user_id: userId }).select('points', 'streak', 'achievements', 'badges').first();
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    progress: progress?.progress || {},
                    points: stats?.points || 0,
                    streak: stats?.streak || 0 | 0,
                    achievements: stats?.achievements || [],
                    badges: stats?.badges || []
                })
            };
        } else if (event.httpMethod === 'POST') {
            if (!event.body) {
                return {
                    statusCode: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({ error: 'Отсутствует тело запроса' })
                };
            }
            const data = JSON.parse(event.body);
            console.log('Saving progress:', data); // Для отладки
            await db('user_progress')
                .insert({ user_id: userId, progress: data.progress || {} })
                .onConflict('user_id')
                .merge();
            await db('user_stats')
                .insert({
                    user_id: userId,
                    points: data.points || 0,
                    streak: data.streak || 0,
                    achievements: JSON.stringify(data.achievements || []),
                    badges: JSON.stringify(data.badges || [])
                })
                .onConflict('user_id')
                .merge();
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ message: 'Прогресс сохранён' })
            };
        }
    } catch (error) {
        console.error('Progress error:', error);
        if (error.name === 'TokenExpiredError') {
            return {
                statusCode: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Токен истек. Пожалуйста, войдите снова.' })
            };
        }
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Ошибка обработки прогресса' })
        };
    }
};
