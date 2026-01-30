"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.initDb = initDb;
const pg_1 = require("pg");
exports.pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/traffic'
});
async function initDb() {
    await exports.pool.connect();
    console.log('Postgres connected');
}
