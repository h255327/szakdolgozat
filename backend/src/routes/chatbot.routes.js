const express = require('express');
const router  = express.Router();
const chatbotController = require('../controllers/chatbot.controller');
const { authenticate } = require('../middleware/auth.middleware');

// POST /api/chatbot/message  (auth required)
router.post('/message', authenticate, chatbotController.sendMessage);

module.exports = router;
