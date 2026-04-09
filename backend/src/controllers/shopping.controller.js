const shoppingService = require('../services/shopping.service');

async function generate(req, res) {
  try {
    const { recipe_ids } = req.body;
    const result = await shoppingService.generateFromRecipes(recipe_ids);
    return res.json(result);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || 'Failed to generate shopping list.' });
  }
}

module.exports = { generate };
