const { db } = require('./db');
const jwt = require('jsonwebtoken');
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

        const users = await db('users').where({ login }).select('id', 'password_hash');
        if (users.length === 0) {
            return {
                statusCode: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Неверный логин или пароль' })
            };
        }

        const isValid = await bcrypt.compare(password, users[0].password_hash);
        if (!isValid) {
            return {
                statusCode: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Неверный логин или пароль' })
            };
        }

        const token = jwt.sign(
            { userId: users[0].id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ token })
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Ошибка входа' })
        };
    }
};
