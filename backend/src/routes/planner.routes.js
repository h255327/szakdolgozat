const express = require('express');
const router = express.Router();
const plannerController = require('../controllers/planner.controller');
const { authenticate } = require('../middleware/auth.middleware');

// GET /api/planner/daily  — generate a personalised daily meal plan
router.get('/daily', authenticate, plannerController.getDailyPlan);

module.exports = router;
