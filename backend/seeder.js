const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('./src/models/Question');

// Ortam değişkenlerini yükle
dotenv.config();

// Veritabanı bağlantısı
mongoose.connect(process.env.MONGO_URI, { 
  family: 4,
  serverSelectionTimeoutMS: 5000 
});

const questions = [
  {
    questionText: 'Aşağıdakilerden hangisi bir türev kuralıdır?',
    options: {
      A: 'Çarpımın Türevi',
      B: 'İntegralin Türevi',
      C: 'Matrisin Türevi',
      D: 'Permütasyonun Türevi'
    },
    correctAnswer: 'A',
    examType: 'AYT',
    subject: 'AYT Matematik',
    topic: 'Türev ve İntegral',
    difficulty: 2
  },
  {
    questionText: 'Fuzuli hangi dönem divan şairidir?',
    options: {
      A: '14. Yüzyıl',
      B: '15. Yüzyıl',
      C: '16. Yüzyıl',
      D: '17. Yüzyıl'
    },
    correctAnswer: 'C',
    examType: 'AYT',
    subject: 'AYT Edebiyat',
    topic: 'Divan Edebiyatı',
    difficulty: 2
  },
  {
    questionText: 'Paragrafta ana düşünce cümlesi genellikle nerede bulunur?',
    options: {
      A: 'Sadece giriş cümlesinde',
      B: 'Sadece sonuç cümlesinde',
      C: 'Giriş veya sonuç cümlesinde',
      D: 'Hiçbir zaman açıkça belirtilmez'
    },
    correctAnswer: 'C',
    examType: 'TYT',
    subject: 'TYT Türkçe',
    topic: 'Paragrafta Anlam',
    difficulty: 1
  },
  {
    questionText: 'Rasyonel sayılar kümesi hangi harfle gösterilir?',
    options: {
      A: 'Z',
      B: 'Q',
      C: 'R',
      D: 'N'
    },
    correctAnswer: 'B',
    examType: 'TYT',
    subject: 'TYT Matematik',
    topic: 'Rasyonel Sayılar',
    difficulty: 1
  }
];

const importData = async () => {
  try {
    await Question.deleteMany(); // Önceki soruları temizle
    await Question.insertMany(questions);
    console.log('Veriler veritabanına başarıyla eklendi!');
    process.exit();
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Question.deleteMany();
    console.log('Veriler veritabanından başarıyla silindi!');
    process.exit();
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
