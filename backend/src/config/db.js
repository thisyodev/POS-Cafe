import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// โหลด .env เฉพาะ local dev
dotenv.config();

let pool;

if (process.env.DATABASE_URL) {
  // ใช้ Railway DATABASE_URL
  const dbUrl = new URL(process.env.DATABASE_URL);

  pool = mysql.createPool({
    host: dbUrl.hostname,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.replace(/^\//, ''),
    port: dbUrl.port || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
} else if (
  process.env.DB_HOST &&
  process.env.DB_USER &&
  process.env.DB_PASSWORD &&
  process.env.DB_NAME
) {
  // ใช้ local .env
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
} else {
  throw new Error('No valid database configuration found.');
}

export default pool;
