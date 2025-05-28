const db = require('../config/db');

// ===========================================
// FIND USER BY EMAIL
// ===========================================
const findUserByEmail = (email, callback) => {
  const sql = 'SELECT * FROM users WHERE email = ?';

  // Look up user by their email address
  db.query(sql, [email], callback);
};

// ===========================================
// CREATE A NEW USER
// ===========================================
const createUser = (name, email, password, callback) => {
  const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';

  // Insert a new user into the database with name, email, and hashed password
  db.query(sql, [name, email, password], callback);
};

module.exports = { findUserByEmail, createUser };
