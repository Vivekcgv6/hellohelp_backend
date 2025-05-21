// models/userModel.js
const db = require('../config/db'); // Make sure this path is correct

const createUser = async (username, email, phone, hashedPassword) => {
  const result = await db.query(
    'INSERT INTO users (username, email, phone, password) VALUES ($1, $2, $3, $4) RETURNING *',
    [username, email, phone, hashedPassword]
  );
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const result = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

module.exports = {
  createUser,
  findUserByEmail
};
