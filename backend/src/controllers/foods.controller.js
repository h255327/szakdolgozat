const FoodModel = require('../models/food.model');

async function search(req, res) {
  try {
    const q = (req.query.search || '').trim();
    if (!q) return res.json({ foods: [] });
    const foods = await FoodModel.search(q);
    return res.json({ foods });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to search foods.' });
  }
}

module.exports = { search };
