const { pool } = require('../config/db');

const SELECT_COLS = `
  id, user_id, title, summary, category, image_url, content, created_at, updated_at
`;

async function findAll() {
  const [rows] = await pool.query(
    `SELECT ${SELECT_COLS} FROM articles ORDER BY created_at DESC`
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT ${SELECT_COLS} FROM articles WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function create({ userId, title, summary, category, image_url, content }) {
  const [result] = await pool.query(
    `INSERT INTO articles (user_id, title, summary, category, image_url, content)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, title, summary ?? null, category ?? null, image_url ?? null, content]
  );
  return findById(result.insertId);
}

const UPDATABLE_FIELDS = ['title', 'summary', 'category', 'image_url', 'content'];

async function updateById(id, data) {
  const fields = Object.keys(data).filter((k) => UPDATABLE_FIELDS.includes(k));
  if (fields.length === 0) return findById(id);

  const setClause = fields.map((k) => `${k} = ?`).join(', ');
  await pool.query(
    `UPDATE articles SET ${setClause} WHERE id = ?`,
    [...fields.map((k) => data[k]), id]
  );
  return findById(id);
}

async function removeById(id) {
  await pool.query('DELETE FROM articles WHERE id = ?', [id]);
}

module.exports = { findAll, findById, create, updateById, removeById };
