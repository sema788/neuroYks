/**
 * Sınıf Sorumluluğu: Test modülü işlemlerini yönetir. (Component Logic - Asenkron Backend Entegrasyonu)
 */
class QuizComponent {
    constructor(appContext) {
        this.app = appContext;
        this.currentQIndex = 0;
        this.quizScore = 0;
        this.questions = [];
        this.userAnswers = [];
        this.activeSubject = "";
        this.activeTopic = "";
        this.activeExamType = "";
        this.hasSelected = false;
    }

    async openQuiz(subjectName, topicTitle, examType) {
        this.activeSubject = subjectName;
        this.activeTopic = topicTitle;
        this.activeExamType = examType;
        this.quizScore = 0;
        this.currentQIndex = 0;
        this.userAnswers = [];
        
        document.getElementById('quiz-modal').classList.remove('hidden');
        const container = document.getElementById('quiz-dynamic-content');
        container.innerHTML = `<p style="text-align:center; padding:30px; color:var(--text-gray);">Sorular yükleniyor...</p>`;

        // Backend'den gerçek soruları çek (10 tane limit)
        this.questions = await this.app.db.getQuestionsForTopic(examType, subjectName, topicTitle); 
        
        if (!this.questions || this.questions.length === 0) {
            container.innerHTML = `<p style="text-align:center; padding:30px; color:var(--danger);">Bu konu için henüz soru bulunamadı.</p>
                                   <button class="btn-primary" style="margin-top:20px;" onclick="window.NeuroApp.quiz.closeQuiz()">Kapat</button>`;
            return;
        }

        this.renderQuestion();
    }

    closeQuiz() {
        document.getElementById('quiz-modal').classList.add('hidden');
    }

    renderQuestion() {
        const container = document.getElementById('quiz-dynamic-content');
        this.hasSelected = false;
        
        const qData = this.questions[this.currentQIndex];
        const totalQ = this.questions.length;

        // Harf seçenekleri (A, B, C, D)
        const letters = ['A', 'B', 'C', 'D'];
        let optionsHTML = "";
        
        qData.opts.forEach((opt, idx) => {
            optionsHTML += `<button class="opt-btn" id="opt-btn-${letters[idx]}" onclick="window.NeuroApp.quiz.checkAnswer(this, '${qData.id}', '${letters[idx]}')">${letters[idx]}) ${opt.text}</button>`;
        });

        container.innerHTML = `
            <header class="quiz-header">
                <div class="quiz-header-info">
                    <span class="quiz-badge">${this.activeExamType} - ${this.activeSubject}</span>
                    <h3 id="quiz-topic-title">${this.activeTopic}</h3>
                </div>
                <button class="btn-close" onclick="window.NeuroApp.quiz.closeQuiz()"><i class="fa-solid fa-xmark"></i></button>
            </header>
            <div class="quiz-body">
                <div class="question-meta" style="margin-bottom:10px;">Soru ${this.currentQIndex + 1} / ${totalQ}</div>
                <p class="question-text">${qData.q}</p>
                <div class="options">${optionsHTML}</div>
            </div>
            <div id="next-btn-container"></div>
        `;
    }

    async checkAnswer(btnElement, questionId, selectedLetter) {
        if(this.hasSelected) return;
        this.hasSelected = true;

        const options = document.querySelectorAll('.opt-btn');
        options.forEach(opt => { opt.style.pointerEvents = "none"; });

        // Butona yükleniyor efekti ver
        btnElement.innerHTML += ' <i class="fa-solid fa-spinner fa-spin"></i>';

        // Backend'e cevabı sor
        const checkResult = await this.app.db.checkAnswer(questionId, selectedLetter);
        
        // Spinner'ı temizle
        btnElement.innerHTML = btnElement.innerHTML.replace('<i class="fa-solid fa-spinner fa-spin"></i>', '');

        if(checkResult && checkResult.isCorrect) {
            btnElement.classList.add('correct');
            this.quizScore++;
            this.app.showToast("Doğru", "Mükemmel mantık!");
        } else {
            btnElement.classList.add('wrong');
            // Doğru şıkkı yeşil yap
            if (checkResult && checkResult.correctAnswer) {
                const correctBtn = document.getElementById(`opt-btn-${checkResult.correctAnswer}`);
                if (correctBtn) correctBtn.classList.add('correct');
            }
        }

        // Analiz için kullanıcının cevabını kaydet
        this.userAnswers.push({
            questionId: questionId,
            selectedAnswer: selectedLetter,
            correctAnswer: checkResult ? checkResult.correctAnswer : selectedLetter,
            isCorrect: checkResult ? checkResult.isCorrect : false
        });

        const isLast = (this.currentQIndex === this.questions.length - 1);
        document.getElementById('next-btn-container').innerHTML = `
            <button class="btn-next" onclick="window.NeuroApp.quiz.nextQuestion()">${isLast ? "Sonuçları Gör" : "Sonraki Soru <i class='fa-solid fa-arrow-right'></i>"}</button>
        `;
    }

    async nextQuestion() {
        this.currentQIndex++;
        if(this.currentQIndex < this.questions.length) {
            this.renderQuestion();
        } else {
            // Test bitti, sonuçları göster
            await this.renderQuizResult();
        }
    }

    async renderQuizResult() {
        const container = document.getElementById('quiz-dynamic-content');
        container.innerHTML = `<p style="text-align:center; padding:30px; color:var(--text-gray);">Sonuçlar kaydediliyor...</p>`;
        
        const totalQ = this.questions.length;

        // Backend'e sonuçları gönder (Spaced Repetition tetiklenir)
        const result = await this.app.db.submitQuizResult(
            this.activeExamType,
            this.activeSubject,
            this.activeTopic,
            totalQ,
            this.quizScore,
            this.userAnswers
        );

        let msg = "İyi iş çıkardın!";
        if (result && result.feedback) {
            msg = result.feedback;
        }

        container.innerHTML = `
            <div class="results-screen">
                <i class="fa-solid fa-trophy results-icon"></i>
                <h3 style="color:var(--neon-cyan); margin-bottom:10px;">Test Tamamlandı!</h3>
                <div class="results-score">${this.quizScore} / ${totalQ} Doğru</div>
                <p class="results-msg">${msg}</p>
                <button class="btn-primary" onclick="window.NeuroApp.dashboard.calculateAnalysis(); window.NeuroApp.quiz.closeQuiz();">Ana Ekrana Dön</button>
            </div>
        `;
    }
}
