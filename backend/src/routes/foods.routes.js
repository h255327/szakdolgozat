const express = require('express');
const router = express.Router();
const foodsController = require('../controllers/foods.controller');
const { authenticate } = require('../middleware/auth.middleware');

// GET /api/foods?search=chicken
router.get('/', authenticate, foodsController.search);

module.exports = router;
