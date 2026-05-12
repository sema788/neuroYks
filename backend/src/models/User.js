const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Kullanıcı Modeli (OOP: Mongoose Schema)
 * Kullanıcının adı, e-postası, şifresi, hedef sınavı (TYT/AYT/BOTH) ve
 * genel istatistikleri burada tutulur.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Lütfen isim girin'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Lütfen e-posta girin'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Geçerli bir e-posta girin'],
    },
    password: {
      type: String,
      required: [true, 'Lütfen şifre girin'],
      minlength: 6,
      select: false, // Sorgularda şifreyi gönderme
    },
    // Hangi sınava çalışıyor: TYT, AYT veya BOTH
    examTarget: {
      type: String,
      enum: ['TYT', 'AYT', 'BOTH'],
      default: 'BOTH',
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    // Toplam kazanılan puan (gamification)
    totalPoints: {
      type: Number,
      default: 0,
    },
    // Toplam çözülen soru sayısı
    totalSolved: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true } // createdAt ve updatedAt otomatik
);

// ─── MIDDLEWARE: Kayıt öncesi şifreyi hashle ───────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── METHOD: Şifre karşılaştır ─────────────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ─── METHOD: JWT token üret ────────────────────────────────────────────────
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = mongoose.model('User', userSchema);
