require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./src/config/db');

// Rotaları içe aktar
const routes = require('./src/routes/index');

const app = express();

// Veritabanına (MongoDB) bağlan
connectDB();

// Middleware'ler
app.use(cors()); // Frontend ile backend'in haberleşmesi için
app.use(express.json()); // Gelen JSON verilerini okuyabilmek için
app.use(morgan('dev')); // İstekleri konsola loglamak için

// Ana API rotası
app.use('/api', routes);

// Basit bir health-check (sağlık kontrolü) rotası
app.get('/', (req, res) => {
  res.send('YKS Asistan Backend API Çalışıyor!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Sunucu ${process.env.NODE_ENV} modunda ${PORT} portunda çalışıyor.`);
});
