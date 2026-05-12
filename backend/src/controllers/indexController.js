// Test amaçlı basit bir controller
exports.getStatus = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'YKS Asistan API aktif ve sorunsuz çalışıyor.',
    timestamp: new Date().toISOString()
  });
};
