const { db } = require('./db');
const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
    const token = event.headers.authorization?.split(' ')[1];
    if (!token) {
        return {
            statusCode: 401,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.stringify({ error: 'Неавторизован' })
        };
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const user = await db('users').where({ id: userId }).select('login').first();
        if (!user) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Пользователь не найден' })
            };
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ login: user.login })
        };
    } catch (error) {
        console.error('User data error:', error);
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
            body: JSON.stringify({ error: 'Ошибка получения данных пользователя' })
        };
    }
};
