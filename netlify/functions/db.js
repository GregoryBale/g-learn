const { neon } = require('@neondatabase/serverless');
const { Pool } = require('pg');
const knex = require('knex');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const sql = neon(process.env.DATABASE_URL);
const db = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    }
});

module.exports = { sql, db, pool };
