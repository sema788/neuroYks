const User = require('../models/User');

/**
 * AUTH CONTROLLER
 * Kullanıcı kayıt, giriş ve profil işlemlerini yönetir.
 */

// ─── Yardımcı: Token oluştur ve cookie ile gönder ─────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      examTarget: user.examTarget,
      totalPoints: user.totalPoints,
      totalSolved: user.totalSolved,
    },
  });
};

// ─── @POST /api/auth/register ──────────────────────────────────────────────
// @desc  Yeni kullanıcı kaydı
// @access Public
const register = async (req, res) => {
  try {
    const { name, email, password, examTarget } = req.body;

    // Aynı e-posta ile kayıt var mı kontrol et
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Bu e-posta adresi zaten kayıtlı.' });
    }

    const user = await User.create({ name, email, password, examTarget: examTarget || 'BOTH' });
    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @POST /api/auth/login ─────────────────────────────────────────────────
// @desc  Kullanıcı girişi
// @access Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'E-posta ve şifre gereklidir.' });
    }

    // Şifreyi de çek (select: false olduğu için + ile istiyoruz)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Geçersiz e-posta veya şifre.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Geçersiz e-posta veya şifre.' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @GET /api/auth/me ─────────────────────────────────────────────────────
// @desc  Giriş yapmış kullanıcının profilini getir
// @access Private (JWT gerekli)
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @PUT /api/auth/update-target ─────────────────────────────────────────
// @desc  Kullanıcının hedef sınavını güncelle (TYT/AYT/BOTH)
// @access Private
const updateExamTarget = async (req, res) => {
  try {
    const { examTarget } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { examTarget },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getMe, updateExamTarget };
