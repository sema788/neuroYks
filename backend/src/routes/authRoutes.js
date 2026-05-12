const express = require('express');
const {
  register,
  login,
  getMe,
  updateExamTarget,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public Rotalar
router.post('/register', register);
router.post('/login', login);

// Korumalı Rotalar (Giriş gerektirir)
router.get('/me', protect, getMe);
router.put('/update-target', protect, updateExamTarget);

module.exports = router;
