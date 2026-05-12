const mongoose = require('mongoose');

/**
 * Kullanıcı İlerleme Modeli - Spaced Repetition Algoritmasının Kalbi!
 * Her kullanıcı için her konu başlığının ne zaman çalışıldığı,
 * başarı oranı ve bir sonraki tekrar tarihi burada tutulur.
 *
 * Spaced Repetition Algoritması (SM-2 benzeri):
 * - Doğru çözüldükçe tekrar aralığı uzar (1 gün → 3 gün → 7 gün → 14 gün...)
 * - Yanlış çözüldükçe tekrar aralığı sıfırlanır
 */
const userProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    examType: {
      type: String,
      enum: ['TYT', 'AYT'],
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    // Konu öğrenildi mi olarak işaretlendi mi?
    isCompleted: {
      type: Boolean,
      default: false,
    },
    // Kaç kez test çözüldü
    attemptCount: {
      type: Number,
      default: 0,
    },
    // Toplam doğru sayısı
    totalCorrect: {
      type: Number,
      default: 0,
    },
    // Toplam soru sayısı
    totalQuestions: {
      type: Number,
      default: 0,
    },
    // Başarı yüzdesi (0-100)
    successRate: {
      type: Number,
      default: 0,
    },
    // Spaced Repetition: Tekrar aralığı (gün olarak)
    interval: {
      type: Number,
      default: 1,
    },
    // Spaced Repetition: Kolaylık faktörü (SM-2 algoritması)
    easeFactor: {
      type: Number,
      default: 2.5,
    },
    // Bir sonraki tekrar tarihi
    nextReviewDate: {
      type: Date,
      default: Date.now,
    },
    // Son test tarihi
    lastAttemptDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

// ─── INDEX: Kullanıcı + Konu kombinasyonu tekil olsun ──────────────────────
userProgressSchema.index({ user: 1, examType: 1, subject: 1, topic: 1 }, { unique: true });

// ─── METHOD: Spaced Repetition Hesaplama (SM-2 Algoritması) ───────────────
userProgressSchema.methods.calculateNextReview = function (score, total) {
  const percentage = (score / total) * 100;

  if (percentage >= 80) {
    // İyi performans: Aralığı uzat
    this.interval = Math.round(this.interval * this.easeFactor);
    this.easeFactor = Math.min(2.5, this.easeFactor + 0.1);
  } else if (percentage >= 50) {
    // Orta performans: Aralığı biraz uzat
    this.interval = Math.round(this.interval * 1.2);
  } else {
    // Kötü performans: Başa dön, yarın tekrar
    this.interval = 1;
    this.easeFactor = Math.max(1.3, this.easeFactor - 0.2);
  }

  // Maksimum 30 gün aralık
  this.interval = Math.min(this.interval, 30);

  // Sonraki tarihi hesapla
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + this.interval);
  this.nextReviewDate = nextDate;
};

module.exports = mongoose.model('UserProgress', userProgressSchema);
