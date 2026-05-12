const mongoose = require('mongoose');

/**
 * Quiz Sonuç Modeli
 * Kullanıcının her test çözümünün detaylı kaydı tutulur.
 * Analiz ekranındaki grafikler bu verilerden beslenir.
 */
const quizResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    examType: { type: String, enum: ['TYT', 'AYT'], required: true },
    subject: { type: String, required: true },
    topic: { type: String, required: true },
    // Kaç soru vardı
    totalQuestions: { type: Number, required: true },
    // Kaç doğru
    correctCount: { type: Number, required: true },
    // Kaç yanlış
    wrongCount: { type: Number, required: true },
    // Yüzde başarı
    scorePercentage: { type: Number, required: true },
    // Kaç saniyede tamamlandı
    durationSeconds: { type: Number },
    // Soruların detayları (hangi soru doğru/yanlış)
    answers: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        selectedAnswer: { type: String, enum: ['A', 'B', 'C', 'D'] },
        correctAnswer: { type: String, enum: ['A', 'B', 'C', 'D'] },
        isCorrect: { type: Boolean },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('QuizResult', quizResultSchema);
