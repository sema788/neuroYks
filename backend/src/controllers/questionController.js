const Question = require('../models/Question');

/**
 * QUESTION CONTROLLER
 * Soru bankası işlemlerini yönetir.
 */

// ─── @GET /api/questions ───────────────────────────────────────────────────
// @desc  Filtrelenmiş soruları getir (examType, subject, topic, limit)
// @access Private
const getQuestions = async (req, res) => {
  try {
    const { examType, subject, topic, limit = 10 } = req.query;

    // Dinamik filtre objesi oluştur
    const filter = {};
    if (examType) filter.examType = examType;
    if (subject) filter.subject = subject;
    if (topic) filter.topic = topic;

    // Soruları karışık sırada getir (MongoDB aggregate ile)
    const questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: parseInt(limit) } }, // Rastgele limit kadar soru seç
      {
        $project: {
          questionText: 1,
          options: 1,
          examType: 1,
          subject: 1,
          topic: 1,
          difficulty: 1,
          // correctAnswer'ı burada GÖNDERMIYORUZ (güvenlik!)
        },
      },
    ]);

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bu konu için henüz soru bulunamadı.',
      });
    }

    res.status(200).json({ success: true, count: questions.length, data: questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @POST /api/questions/check ────────────────────────────────────────────
// @desc  Verilen cevabı kontrol et ve doğru cevabı döndür
// @access Private
const checkAnswer = async (req, res) => {
  try {
    const { questionId, selectedAnswer } = req.body;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Soru bulunamadı.' });
    }

    const isCorrect = question.correctAnswer === selectedAnswer;

    // İstatistik güncelle
    question.solvedCount += 1;
    if (isCorrect) question.correctCount += 1;
    await question.save();

    res.status(200).json({
      success: true,
      isCorrect,
      correctAnswer: question.correctAnswer,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @POST /api/questions (Admin) ─────────────────────────────────────────
// @desc  Yeni soru ekle
// @access Private/Admin
const addQuestion = async (req, res) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json({ success: true, data: question });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── @GET /api/questions/topics ────────────────────────────────────────────
// @desc  Soru bankasındaki tüm benzersiz konu listesini getir
// @access Private
const getTopics = async (req, res) => {
  try {
    const { examType } = req.query;
    const filter = examType ? { examType } : {};

    const topics = await Question.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { examType: '$examType', subject: '$subject', topic: '$topic' },
          questionCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.examType': 1, '_id.subject': 1 } },
    ]);

    res.status(200).json({ success: true, count: topics.length, data: topics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getQuestions, checkAnswer, addQuestion, getTopics };
