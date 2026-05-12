const express = require('express');
const {
  getQuestions,
  checkAnswer,
  addQuestion,
  getTopics,
} = require('../controllers/questionController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Korumalı Rotalar (Giriş gerektirir)
router.get('/', protect, getQuestions);
router.get('/topics', protect, getTopics);
router.post('/check', protect, checkAnswer);

// Sadece Admin (Soru ekleme)
router.post('/', protect, adminOnly, addQuestion);

module.exports = router;
