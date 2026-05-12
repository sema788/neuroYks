/**
 * Sınıf Sorumluluğu: Alt Menü geçiş animasyonları ve mantığı. (Component Logic)
 */
class Navigation {
    constructor(appContext) {
        this.app = appContext;
    }

    // Seçili sekmeyi değiştirme işlemi (Öğren / Tekrar / Analiz)
    switchTab(tabName, event) {
        if(event) event.preventDefault();
        
        // Önceki active ayarlarını temizle
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        
        // Yeni ekranı active yap
        document.getElementById(`tab-${tabName}`).classList.add('active');
        if(event) event.currentTarget.classList.add('active');
        
        // Analiz ekranı açıldıysa güncel istatistikleri hesapla
        if(tabName === 'analyze') {
            this.app.dashboard.calculateAnalysis();
        }
    }
}
