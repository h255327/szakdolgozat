const express = require('express');
const router = express.Router();

const authRoutes            = require('./auth.routes');
const usersRoutes           = require('./users.routes');
const recipesRoutes         = require('./recipes.routes');
const articlesRoutes        = require('./articles.routes');
const mealsRoutes           = require('./meals.routes');
const foodsRoutes           = require('./foods.routes');
const plannerRoutes         = require('./planner.routes');
const recommendationsRoutes = require('./recommendations.routes');
const shoppingRoutes        = require('./shopping.routes');
const chatbotRoutes         = require('./chatbot.routes');
const adminRoutes           = require('./admin.routes');

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

router.use('/auth',            authRoutes);
router.use('/users',           usersRoutes);
router.use('/recipes',         recipesRoutes);
router.use('/articles',        articlesRoutes);
router.use('/meals',           mealsRoutes);
router.use('/foods',           foodsRoutes);
router.use('/planner',         plannerRoutes);
router.use('/recommendations', recommendationsRoutes);
router.use('/shopping',        shoppingRoutes);
router.use('/chatbot',         chatbotRoutes);
router.use('/admin',           adminRoutes);

module.exports = router;
