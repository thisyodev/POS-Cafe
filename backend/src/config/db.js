import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'pos_cafe',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
