const express = require('express');
const {
  getProgress,
  getDueToday,
  markTopicComplete,
  saveQuizResult,
  getStats,
} = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Tüm rotalar giriş gerektirir
router.use(protect);

router.get('/', getProgress);
router.get('/due-today', getDueToday);
router.put('/complete', markTopicComplete);
router.post('/quiz-result', saveQuizResult);
router.get('/stats', getStats);

module.exports = router;
