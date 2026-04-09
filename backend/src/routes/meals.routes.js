const express = require('express');
const router = express.Router();
const mealsController = require('../controllers/meals.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All meal routes require authentication
router.use(authenticate);

// GET  /api/meals?date=YYYY-MM-DD
router.get('/',                                        mealsController.getByDate);

// POST /api/meals
router.post('/',                                       mealsController.createMeal);

// POST /api/meals/:mealId/items
router.post('/:mealId/items',                          mealsController.addItem);

// POST /api/meals/:mealId/items/from-food
router.post('/:mealId/items/from-food',                mealsController.addItemFromFood);

// PUT  /api/meals/:mealId/items/:itemId
router.put('/:mealId/items/:itemId',                   mealsController.updateItem);

// DELETE /api/meals/:mealId/items/:itemId
router.delete('/:mealId/items/:itemId',                mealsController.deleteItem);

module.exports = router;
