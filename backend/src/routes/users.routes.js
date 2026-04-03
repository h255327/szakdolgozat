const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { authenticate } = require('../middleware/auth.middleware');

// GET  /api/users/me  (protected)
router.get('/me', authenticate, usersController.getMe);

// PUT  /api/users/me  (protected)
router.put('/me', authenticate, usersController.updateMe);

// GET  /api/users/profile
router.get('/profile', usersController.getProfile);

// PUT  /api/users/profile
router.put('/profile', usersController.updateProfile);

// DELETE /api/users/profile
router.delete('/profile', usersController.deleteAccount);

module.exports = router;
