// File: server/config/db.js
// Purpose: Create and export a MySQL connection pool using mysql2/promise.

const mysql = require('mysql2/promise');

// Adjust these settings if your XAMPP MySQL uses a password or different user.
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'task_manager',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
