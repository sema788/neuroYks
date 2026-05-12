const mongoose = require('mongoose');

/**
 * Soru Modeli
 * Her soru; hangi sınava (TYT/AYT), hangi derse ve hangi konuya ait olduğunu,
 * 4 şıkkı ve doğru cevabı içerir.
 * Ayrıca kaç kez sorulduğu ve zorluğu da tutulur (ileride AI için kullanılabilir).
 */
const questionSchema = new mongoose.Schema(
  {
    // Soru metni
    questionText: {
      type: String,
      required: [true, 'Soru metni gereklidir'],
      trim: true,
    },
    // 4 şık (A, B, C, D)
    options: {
      A: { type: String, required: true },
      B: { type: String, required: true },
      C: { type: String, required: true },
      D: { type: String, required: true },
    },
    // Doğru cevap harfi
    correctAnswer: {
      type: String,
      required: true,
      enum: ['A', 'B', 'C', 'D'],
    },
    // Hangi sınav türü
    examType: {
      type: String,
      required: true,
      enum: ['TYT', 'AYT'],
    },
    // Ders adı (örn: "Türkçe", "Matematik")
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    // Konu başlığı (örn: "Sözcükte Anlam", "Türev")
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    // Hangi yılın sınavından alındı (opsiyonel)
    year: {
      type: Number,
    },
    // Zorluk seviyesi (1=Kolay, 2=Orta, 3=Zor)
    difficulty: {
      type: Number,
      enum: [1, 2, 3],
      default: 2,
    },
    // Bu soruyu kaç kullanıcı çözdü (istatistik için)
    solvedCount: {
      type: Number,
      default: 0,
    },
    // Kaç kullanıcı doğru çözdü
    correctCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ─── İNDEX: Hızlı arama için ───────────────────────────────────────────────
questionSchema.index({ examType: 1, subject: 1, topic: 1 });

module.exports = mongoose.model('Question', questionSchema);
