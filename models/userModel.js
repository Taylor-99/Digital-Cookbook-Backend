// models/userModel.js
const pool = require('../db');

// Create user
const createUser = async (username, firstName, lastName, passwordHash) => {
  const result = await pool.query(
    `INSERT INTO users (username, first_name, last_name, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [username, firstName, lastName, passwordHash]
  );
  return result.rows[0];
};

// Find user by username (for login)
const findUserByUsername = async (username) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE username = $1`,
    [username]
  );
  return result.rows[0];
};

const findUserById = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0];
};


module.exports = {
  createUser,
  findUserByUsername,
  findUserById
};