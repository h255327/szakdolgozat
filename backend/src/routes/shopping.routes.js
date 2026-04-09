const express = require('express');
const router  = express.Router();
const shoppingController = require('../controllers/shopping.controller');
const { authenticate } = require('../middleware/auth.middleware');

// POST /api/shopping/generate  — generate list from a set of recipe IDs
router.post('/generate', authenticate, shoppingController.generate);

module.exports = router;
