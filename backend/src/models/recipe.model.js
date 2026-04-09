const { pool } = require('../config/db');

const SELECT_COLS = `
  id, user_id, title, description, category,
  ingredients, instructions, image_url, prep_time, servings,
  created_at, updated_at
`;

async function findAll({ category, search } = {}) {
  const conditions = [];
  const params     = [];

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }

  if (search) {
    conditions.push('(title LIKE ? OR description LIKE ?)');
    const like = `%${search}%`;
    params.push(like, like);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.query(
    `SELECT ${SELECT_COLS} FROM recipes ${where} ORDER BY created_at DESC`,
    params
  );
  return rows;
}

async function findAllCategories() {
  const [rows] = await pool.query(
    'SELECT DISTINCT category FROM recipes WHERE category IS NOT NULL ORDER BY category ASC'
  );
  return rows.map((r) => r.category);
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT ${SELECT_COLS} FROM recipes WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function create({ userId, title, description, category, ingredients, instructions, image_url, prep_time, servings }) {
  const [result] = await pool.query(
    `INSERT INTO recipes
       (user_id, title, description, category, ingredients, instructions, image_url, prep_time, servings)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      title,
      description  ?? null,
      category     ?? null,
      ingredients  ? JSON.stringify(ingredients)  : null,
      instructions ?? null,
      image_url    ?? null,
      prep_time    ?? null,
      servings     ?? 1,
    ]
  );
  return findById(result.insertId);
}

const UPDATABLE_FIELDS = [
  'title', 'description', 'category',
  'ingredients', 'instructions', 'image_url', 'prep_time', 'servings',
];

async function updateById(id, data) {
  const fields = Object.keys(data).filter((k) => UPDATABLE_FIELDS.includes(k));
  if (fields.length === 0) return findById(id);

  const values = fields.map((k) => {
    if (k === 'ingredients' && typeof data[k] !== 'string') {
      return JSON.stringify(data[k]);
    }
    return data[k];
  });

  const setClause = fields.map((k) => `${k} = ?`).join(', ');
  await pool.query(`UPDATE recipes SET ${setClause} WHERE id = ?`, [...values, id]);
  return findById(id);
}

async function removeById(id) {
  await pool.query('DELETE FROM recipes WHERE id = ?', [id]);
}

module.exports = { findAll, findAllCategories, findById, create, updateById, removeById };
