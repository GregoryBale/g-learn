const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

exports.handler = async (event, context) => {
    const token = event.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Токен не предоставлен' })
        };
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Пользователь не найден' })
            };
        }

        if (event.httpMethod === 'GET') {
            const progress = await prisma.progress.findUnique({ where: { userId: user.id } });
            return {
                statusCode: 200,
                body: JSON.stringify({
                    progress: progress?.data || {},
                    points: progress?.points || 0,
                    streak: progress?.streak || 0,
                    achievements: progress?.achievements || [],
                    badges: progress?.badges || []
                })
            };
        }

        if (event.httpMethod === 'POST') {
            const { progress, points, streak, achievements, badges } = JSON.parse(event.body);
            await prisma.progress.upsert({
                where: { userId: user.id },
                update: { data: progress, points, streak, achievements, badges },
                create: {
                    userId: user.id,
                    data: progress,
                    points,
                    streak,
                    achievements,
                    badges
                }
            });
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Прогресс сохранён' })
            };
        }

        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Метод не поддерживается' })
        };
    } catch (error) {
        console.error('Progress error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Ошибка сервера: ' + error.message })
        };
    }
};
