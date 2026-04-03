const { pool } = require('../config/db');

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT id, username, email, weight, goal, diet_type,
            calorie_target, notification_preferences, created_at
     FROM users WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function findByEmail(email) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return rows[0] || null;
}

async function findByUsername(username) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE username = ?',
    [username]
  );
  return rows[0] || null;
}

async function create({ username, email, passwordHash }) {
  const [result] = await pool.query(
    'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
    [username, email, passwordHash]
  );
  return { id: result.insertId, username, email };
}

const UPDATABLE_FIELDS = [
  'username', 'weight', 'goal',
  'diet_type', 'calorie_target', 'notification_preferences',
];

async function updateById(id, data) {
  const fields = Object.keys(data).filter((k) => UPDATABLE_FIELDS.includes(k));
  if (fields.length === 0) return findById(id);

  const values = fields.map((k) => {
    const v = data[k];
    return k === 'notification_preferences' && typeof v === 'object'
      ? JSON.stringify(v)
      : v;
  });

  const setClause = fields.map((k) => `${k} = ?`).join(', ');
  await pool.query(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, id]);

  return findById(id);
}

module.exports = { findById, findByEmail, findByUsername, create, updateById };
