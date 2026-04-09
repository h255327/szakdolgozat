const mealsService = require('../services/meals.service');

async function getByDate(req, res) {
  try {
    const result = await mealsService.getByDate(req.user.id, req.query.date);
    return res.json(result);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || 'Failed to fetch meals.' });
  }
}

async function createMeal(req, res) {
  try {
    const meal = await mealsService.createMeal(req.user.id, req.body);
    return res.status(201).json({ message: 'Meal created.', meal });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || 'Failed to create meal.' });
  }
}

async function addItem(req, res) {
  try {
    const item = await mealsService.addItem(Number(req.params.mealId), req.user.id, req.body);
    return res.status(201).json({ message: 'Item added.', item });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || 'Failed to add item.' });
  }
}

async function updateItem(req, res) {
  try {
    const item = await mealsService.updateItem(
      Number(req.params.mealId),
      Number(req.params.itemId),
      req.user.id,
      req.body
    );
    return res.json({ message: 'Item updated.', item });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || 'Failed to update item.' });
  }
}

async function deleteItem(req, res) {
  try {
    await mealsService.deleteItem(
      Number(req.params.mealId),
      Number(req.params.itemId),
      req.user.id
    );
    return res.json({ message: 'Item deleted.' });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || 'Failed to delete item.' });
  }
}

async function addItemFromFood(req, res) {
  try {
    const item = await mealsService.addItemFromFood(Number(req.params.mealId), req.user.id, req.body);
    return res.status(201).json({ message: 'Item added from food database.', item });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || 'Failed to add item.' });
  }
}

module.exports = { getByDate, createMeal, addItem, addItemFromFood, updateItem, deleteItem };
