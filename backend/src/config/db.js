import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load .env for local dev
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL || ''; // fallback to empty string

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

const dbUrl = new URL(DATABASE_URL);

const pool = mysql.createPool({
  host: dbUrl.hostname,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.replace(/^\//, ''),
  port: dbUrl.port || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
