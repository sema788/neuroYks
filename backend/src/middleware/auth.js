const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT Kimlik Doğrulama Middleware'i
 * Korunan route'lara gelen her istekte token kontrol eder.
 * Token geçerliyse kullanıcıyı req.user'a ekler ve devam eder.
 */
const protect = async (req, res, next) => {
  let token;

  // Token'ı Authorization header'ından al (Bearer token formatı)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Bu işlem için giriş yapmanız gerekiyor.',
    });
  }

  try {
    // Token'ı doğrula ve içindeki kullanıcı ID'sini çöz
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Kullanıcı bulunamadı.' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Geçersiz veya süresi dolmuş token.' });
  }
};

/**
 * Admin Yetki Kontrolü
 * protect middleware'inden sonra kullanılır.
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Bu işlem için admin yetkisi gerekiyor.' });
  }
};

module.exports = { protect, adminOnly };
