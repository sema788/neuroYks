const UserProgress = require('../models/UserProgress');
const QuizResult = require('../models/QuizResult');

/**
 * PROGRESS CONTROLLER
 * Kullanıcının konu ilerleme durumu ve Spaced Repetition hesaplamaları.
 */

// ─── @GET /api/progress ────────────────────────────────────────────────────
// @desc  Kullanıcının tüm ilerleme verilerini getir
// @access Private
const getProgress = async (req, res) => {
  try {
    const progress = await UserProgress.find({ user: req.user.id }).sort({ examType: 1, subject: 1 });
    res.status(200).json({ success: true, count: progress.length, data: progress });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @GET /api/progress/due-today ─────────────────────────────────────────
// @desc  Bugün tekrar edilmesi gereken konuları getir (Spaced Repetition)
// @access Private
const getDueToday = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Bugünün sonuna kadar

    const dueTopics = await UserProgress.find({
      user: req.user.id,
      isCompleted: true,
      nextReviewDate: { $lte: today },
    }).sort({ nextReviewDate: 1 });

    res.status(200).json({
      success: true,
      count: dueTopics.length,
      data: dueTopics,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @PUT /api/progress/complete ──────────────────────────────────────────
// @desc  Konuyu öğrenildi olarak işaretle
// @access Private
const markTopicComplete = async (req, res) => {
  try {
    const { examType, subject, topic } = req.body;

    // findOneAndUpdate: yoksa oluştur (upsert: true)
    const progress = await UserProgress.findOneAndUpdate(
      { user: req.user.id, examType, subject, topic },
      {
        isCompleted: true,
        // İlk tamamlandığında yarın tekrar planla
        nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, data: progress });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @POST /api/progress/quiz-result ──────────────────────────────────────
// @desc  Test sonucunu kaydet ve Spaced Repetition güncelle
// @access Private
const saveQuizResult = async (req, res) => {
  try {
    const { examType, subject, topic, totalQuestions, correctCount, answers, durationSeconds } = req.body;

    const wrongCount = totalQuestions - correctCount;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    // 1. Quiz sonucunu kaydet
    const quizResult = await QuizResult.create({
      user: req.user.id,
      examType,
      subject,
      topic,
      totalQuestions,
      correctCount,
      wrongCount,
      scorePercentage,
      durationSeconds,
      answers,
    });

    // 2. İlerleme kaydını bul veya oluştur
    let progress = await UserProgress.findOne({ user: req.user.id, examType, subject, topic });

    if (!progress) {
      progress = new UserProgress({ user: req.user.id, examType, subject, topic });
    }

    // 3. İstatistikleri güncelle
    progress.attemptCount += 1;
    progress.totalCorrect += correctCount;
    progress.totalQuestions += totalQuestions;
    progress.successRate = Math.round((progress.totalCorrect / progress.totalQuestions) * 100);
    progress.lastAttemptDate = new Date();

    // 4. Spaced Repetition hesapla
    progress.calculateNextReview(correctCount, totalQuestions);

    await progress.save();

    // 5. Kullanıcının toplam puanını güncelle (10 puan / doğru soru)
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, {
      $inc: {
        totalPoints: correctCount * 10,
        totalSolved: totalQuestions,
      },
    });

    // 6. Kullanıcıya mesaj üret
    let feedback = '';
    if (scorePercentage >= 80) {
      feedback = 'Harika! Bu konuyu çok iyi kavramışsın. Bir sonraki tekrarın ' + progress.interval + ' gün sonra.';
    } else if (scorePercentage >= 50) {
      feedback = 'İyi gidiyorsun! Biraz daha pratik yaparsan mükemmel olacak.';
    } else {
      feedback = 'Bu konuyu yeniden çalışmanı öneririz. Endişelenme, aralıklı tekrar sistemi seni destekliyor!';
    }

    res.status(201).json({
      success: true,
      quizResult,
      progress,
      feedback,
      nextReviewDate: progress.nextReviewDate,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @GET /api/progress/stats ─────────────────────────────────────────────
// @desc  Kullanıcının genel analiz istatistiklerini getir
// @access Private
const getStats = async (req, res) => {
  try {
    const progressList = await UserProgress.find({ user: req.user.id });
    const quizHistory = await QuizResult.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(10);

    // Konuya göre grupla
    const bySubject = {};
    progressList.forEach((p) => {
      if (!bySubject[p.subject]) {
        bySubject[p.subject] = { total: 0, completed: 0, successRate: 0, rates: [] };
      }
      bySubject[p.subject].total += 1;
      if (p.isCompleted) bySubject[p.subject].completed += 1;
      bySubject[p.subject].rates.push(p.successRate);
    });

    // Ortalama başarıları hesapla
    Object.keys(bySubject).forEach((key) => {
      const rates = bySubject[key].rates;
      bySubject[key].avgSuccessRate = rates.length > 0
        ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length)
        : 0;
      delete bySubject[key].rates;
    });

    res.status(200).json({
      success: true,
      data: {
        bySubject,
        recentQuizzes: quizHistory,
        totalTopicsLearned: progressList.filter((p) => p.isCompleted).length,
        totalTopics: progressList.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProgress, getDueToday, markTopicComplete, saveQuizResult, getStats };
