const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'islacloud',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'islacloud_db',
  connectionLimit: 10,
  acquireTimeout: 30000,
});

module.exports = pool;
