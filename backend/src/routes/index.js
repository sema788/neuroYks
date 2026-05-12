const express = require('express');
const router = express.Router();
const { getStatus } = require('../controllers/indexController');

// Ana API durumunu kontrol etmek için test rotası
router.get('/status', getStatus);

// Alt rotalar
router.use('/auth', require('./authRoutes'));
router.use('/questions', require('./questionRoutes'));
router.use('/progress', require('./progressRoutes'));

module.exports = router;
