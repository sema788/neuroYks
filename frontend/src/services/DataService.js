/**
 * Sınıf Sorumluluğu: Projenin veri kaynağını (Veritabanı Simulasyonu -> Gerçek API) yönetir.
 * Gerekli olduğunda dışarıya (API'ye) istek yapan servis dosyasıdır.
 */
class DataService {
    constructor() {
        // Gerçek Node.js Backend API adresimiz
        this.API_URL = 'http://localhost:5000/api';
        
        // Kullanıcının anlık verisini hafızada tutarız (Token vb.)
        this.currentUser = null;
        this.token = null;
    }

    // --- AUTHENTICATION (KAYIT & GİRİŞ) ---

    async register(name, email, password, examTarget = 'TYT') {
        try {
            const response = await fetch(`${this.API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, examTarget })
            });
            const data = await response.json();
            
            if (data.success) {
                this.currentUser = data.user;
                this.token = data.token;
                return { success: true, user: data.user };
            }
            return { success: false, message: data.message };
        } catch (error) {
            console.error('Kayıt Hatası:', error);
            return { success: false, message: 'Sunucuya ulaşılamadı.' };
        }
    }

    async login(email, password) {
        try {
            const response = await fetch(`${this.API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            
            if (data.success) {
                this.currentUser = data.user;
                this.token = data.token;
                return { success: true, user: data.user };
            }
            return { success: false, message: data.message };
        } catch (error) {
            console.error('Giriş Hatası:', error);
            return { success: false, message: 'Sunucuya ulaşılamadı.' };
        }
    }

    // Yardımcı: Token ile istek atmak için ayarlar
    getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
        };
    }

    // --- DASHBOARD (DERSLER & İSTATİSTİKLER) ---

    // Gerçek API'den Dashboard İstatistiklerini Getir
    async getDashboardStats() {
        if (!this.token) return null;
        try {
            const response = await fetch(`${this.API_URL}/progress/stats`, {
                headers: this.getAuthHeaders()
            });
            const data = await response.json();
            return data.success ? data.data : null;
        } catch (error) {
            console.error('Stats çekilirken hata:', error);
            return null;
        }
    }

    // Gerçek API'den Kullanıcının Seçtiği Sınava Göre Konuları Getir
    async getTopics(examType) {
        if (!this.token) return [];
        try {
            const response = await fetch(`${this.API_URL}/questions/topics?examType=${examType}`, {
                headers: this.getAuthHeaders()
            });
            const data = await response.json();
            
            if (!data.success) return [];
            
            // API'den gelen karmaşık veri formatını bizim frontend'in sevdiği formata (subject -> topics) dönüştürelim
            const formattedSubjects = [];
            
            data.data.forEach(item => {
                const subj = item._id.subject;
                const top = item._id.topic;
                
                let existingSubj = formattedSubjects.find(s => s.name === subj);
                if (!existingSubj) {
                    existingSubj = { id: subj.toLowerCase().replace(/\s/g, ''), name: subj, topics: [] };
                    formattedSubjects.push(existingSubj);
                }
                existingSubj.topics.push({ id: top.toLowerCase().replace(/\s/g, ''), title: top });
            });
            
            return formattedSubjects;
        } catch (error) {
            console.error('Konular çekilirken hata:', error);
            return [];
        }
    }

    // --- QUIZ (TEST ÇÖZME & SPACED REPETITION) ---

    // Belirli bir konu için veritabanından soruları çek
    async getQuestionsForTopic(examType, subjectName, topicTitle) {
        if (!this.token) return [];
        try {
            const response = await fetch(`${this.API_URL}/questions?examType=${examType}&subject=${encodeURIComponent(subjectName)}&topic=${encodeURIComponent(topicTitle)}`, {
                headers: this.getAuthHeaders()
            });
            const data = await response.json();
            
            if (data.success) {
                // Bizim frontend q ve opts bekliyor, API questionText ve options veriyor. Dönüştürelim:
                return data.data.map(q => ({
                    id: q._id,
                    q: q.questionText,
                    opts: [
                        { text: q.options.A, isCorrect: false }, // Doğruluk kontrolü artık backend'de!
                        { text: q.options.B, isCorrect: false },
                        { text: q.options.C, isCorrect: false },
                        { text: q.options.D, isCorrect: false }
                    ]
                }));
            }
            return [];
        } catch (error) {
            console.error('Sorular çekilirken hata:', error);
            return [];
        }
    }

    // İşaretlenen cevabı Backend'e sorup doğru olup olmadığını öğreniriz (Güvenlik!)
    async checkAnswer(questionId, selectedLetter) {
        try {
            const response = await fetch(`${this.API_URL}/questions/check`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ questionId, selectedAnswer: selectedLetter }) // A, B, C, D
            });
            const data = await response.json();
            return data.success ? { isCorrect: data.isCorrect, correctAnswer: data.correctAnswer } : null;
        } catch (error) {
            console.error('Cevap kontrol hatası:', error);
            return null;
        }
    }

    // Test bittiğinde sonucu kaydet ve Aralıklı Tekrar (Spaced Repetition) sistemini tetikle
    async submitQuizResult(examType, subject, topic, totalQ, correctCount, answers) {
        try {
            const response = await fetch(`${this.API_URL}/progress/quiz-result`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({
                    examType,
                    subject,
                    topic,
                    totalQuestions: totalQ,
                    correctCount: correctCount,
                    durationSeconds: 120, // Örnek süre
                    answers: answers
                })
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Sonuç kaydedilirken hata:', error);
            return null;
        }
    }

    // --- TEKRAR EKRANI ---

    async getDueTopics() {
        if (!this.token) return [];
        try {
            const response = await fetch(`${this.API_URL}/progress/due-today`, {
                headers: this.getAuthHeaders()
            });
            const data = await response.json();
            return data.success ? data.data : [];
        } catch (error) {
            console.error('Tekrar konuları çekilirken hata:', error);
            return [];
        }
    }
}
