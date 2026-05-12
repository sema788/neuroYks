/**
 * Sınıf Sorumluluğu: Ana kontrol paneli, konuların listelenmesi ve istatistik çizimini yapar. (Page Logic)
 */
class DashboardPage {
    constructor(appContext) {
        this.app = appContext; // State yönetimi için App nesnesi
        this.loadedSubjects = [];
    }

    // Dashboard'u TYT/AYT seçimine göre oluşturur (API'den veriyi Asenkron çeker)
    async buildDashboard() {
        const container = document.getElementById('subjects-container');
        container.innerHTML = "<p style='text-align:center; padding: 20px; color: var(--text-gray);'>📚 Dersler veritabanından çekiliyor...</p>";

        // Backend'den gerçek konuları çek
        let target = this.app.userTarget;
        if(target === 'BOTH') target = 'TYT'; // Şimdilik sadece birini göstersin veya ikisini de çekeriz.
        
        // Hem TYT hem AYT çekip birleştirme
        let subjectsToRender = [];
        if(this.app.userTarget === 'BOTH') {
            const tyt = await this.app.db.getTopics('TYT');
            const ayt = await this.app.db.getTopics('AYT');
            subjectsToRender = [...tyt.map(s => ({...s, type: 'TYT'})), ...ayt.map(s => ({...s, type: 'AYT'}))];
        } else {
            const data = await this.app.db.getTopics(this.app.userTarget);
            subjectsToRender = data.map(s => ({...s, type: this.app.userTarget}));
        }

        this.loadedSubjects = subjectsToRender;
        container.innerHTML = "";

        if (subjectsToRender.length === 0) {
            container.innerHTML = "<p style='text-align:center; padding: 20px; color: var(--text-gray);'>Bu hedef için henüz soru eklenmemiş.</p>";
            return;
        }

        subjectsToRender.forEach((subject, index) => {
            // Güvenli ID oluşturma
            const subjectKey = `subj-${index}`;
            subject.key = subjectKey;

            const card = document.createElement('div');
            card.className = `subject-card glass-panel ${subject.type === 'AYT' ? 'is-ayt' : ''}`;
            
            card.innerHTML = `
                <div class="subject-header" onclick="window.NeuroApp.dashboard.toggleAccordion('${subjectKey}-topics', event)">
                    <div class="subject-info">
                        <h2 style="font-size: 1.1rem;"><i class="fa-solid fa-book"></i> ${subject.type} ${subject.name}</h2>
                        <p>${subject.topics.length} Alt Konu</p>
                    </div>
                    <i class="fa-solid fa-chevron-down arrow-icon"></i>
                </div>
                <div class="topics-list hidden" id="${subjectKey}-topics"></div>
            `;
            container.appendChild(card);
            this.renderTopics(subject, subject.type);
        });
    }

    // İlgili derse ait konu başlıklarını listeler
    renderTopics(subject, typeRaw) {
        const topicContainer = document.getElementById(`${subject.key}-topics`);
        topicContainer.innerHTML = "";

        subject.topics.forEach(topic => {
            const item = document.createElement('div');
            // Yeni API'de completed bilgisi getStats'ten gelecek, şimdilik UI'da kapalı
            item.className = `topic-item ${topic.completed ? 'completed' : ''}`;
            
            item.innerHTML = `
                <div class="topic-info">
                    <h4>${topic.title}</h4>
                    <p>Çıkmış Sorular Dahil</p>
                </div>
                <div class="topic-actions">
                    <button class="quiz-btn" onclick="window.NeuroApp.quiz.openQuiz('${subject.name}', '${topic.title}', '${typeRaw}')">
                        <i class="fa-solid fa-play"></i> Test Çöz
                    </button>
                </div>
            `;
            topicContainer.appendChild(item);
        });
    }

    // Ders konularını aç/kapa yapan accordion UI mantığı
    toggleAccordion(containerId, event) {
        const container = document.getElementById(containerId);
        const arrow = event.currentTarget.querySelector('.arrow-icon');
        if(container.classList.contains('hidden')){
            container.classList.remove('hidden');
            arrow.classList.add('rotated');
        } else {
            container.classList.add('hidden');
            arrow.classList.remove('rotated');
        }
    }

    // Tüm konuların yüzde kaçının tamamlandığını gösteren analiz motoru (Backend'e bağlı)
    async calculateAnalysis() {
        const analysisContainer = document.getElementById('analysis-container');
        const bars = analysisContainer.querySelectorAll('.prog-item');
        bars.forEach(b => b.remove()); // Eski grafikleri sil

        const stats = await this.app.db.getDashboardStats();
        
        let overall = 0;
        if (stats && stats.bySubject) {
            Object.keys(stats.bySubject).forEach(subKey => {
                const subData = stats.bySubject[subKey];
                const perc = subData.avgSuccessRate || 0;
                
                analysisContainer.insertAdjacentHTML('beforeend', `
                    <div class="prog-item">
                        <div class="prog-info"><span>${subKey}</span> <span>%${perc} Başarı</span></div>
                        <div class="prog-bar"><div class="prog-fill" style="width: ${perc}%"></div></div>
                    </div>
                `);
            });
            
            if(stats.totalTopics > 0) {
                overall = Math.round((stats.totalTopicsLearned / stats.totalTopics) * 100);
            }
        } else {
            analysisContainer.insertAdjacentHTML('beforeend', `
                <p style="color: var(--text-gray); font-size: 0.9rem;">Henüz hiç test çözmediniz. İstatistikleriniz ilk testten sonra oluşacaktır.</p>
            `);
        }

        // Sihirli CSS Circle oran hesabı
        document.getElementById('overall-percentage').innerText = `%${overall}`;
        document.getElementById('overall-chart').style.background = `conic-gradient(var(--neon-purple) ${overall}%, rgba(255,255,255,0.1) 0)`;
    }
}
