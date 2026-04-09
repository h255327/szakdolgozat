const { pool } = require('../config/db');

const SELECT_COLS = `
  id, name, category,
  calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
  default_unit
`;

async function search(query) {
  const like = `%${query}%`;
  const [rows] = await pool.query(
    `SELECT ${SELECT_COLS} FROM foods
     WHERE name LIKE ?
     ORDER BY name ASC
     LIMIT 20`,
    [like]
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT ${SELECT_COLS} FROM foods WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

module.exports = { search, findById };
