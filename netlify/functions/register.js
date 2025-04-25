const { db } = require('./db');
const bcrypt = require('bcrypt');

exports.handler = async (event) => {
    if (!event.body) {
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({ error: 'Отсутствует тело запроса' })
        };
    }

    try {
        const { login, password } = JSON.parse(event.body);
        if (!login || !password) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Логин или пароль отсутствуют' })
            };
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const result = await db('users')
            .insert({ login, password_hash: passwordHash })
            .returning('id');
        
        await db('user_progress').insert({ user_id: result[0].id, progress: '{}' });
        await db('user_stats').insert({
            user_id: result[0].id,
            points: 0,
            streak: 0,
            achievements: '[]',
            badges: '[]'
        });

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ id: result[0].id })
        };
    } catch (error) {
        console.error('Registration error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: error.code === '23505' ? 'Логин уже занят' : 'Ошибка регистрации'
            })
        };
    }
};
