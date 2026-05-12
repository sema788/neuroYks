/**
 * Sınıf Sorumluluğu: Uygulamaya ilk giriş esnasında kullanıcı verilerini alır
 * ve hedef (TYT/AYT) yönlendirmesini sağlar (Page Logic).
 */
class OnboardingPage {
    constructor(appContext) {
        this.app = appContext;
    }

    // İlk adım: İsim girişi
    nextStep() {
        const nameInput = document.getElementById('username-input').value.trim();
        this.app.username = nameInput || "Sema"; // Veri yoksa Default olarak isim atanır
        
        document.getElementById('step-1').classList.remove('active');
        document.getElementById('step-1').classList.add('hidden');
        document.getElementById('step-2').classList.remove('hidden');
        document.getElementById('step-2').classList.add('active');
    }

    // Son adım: Sınav hedefinin seçimi
    async finishOnboarding(target) {
        this.app.userTarget = target;
        
        // --- BACKEND İLE TANIŞMA (KAYIT VEYA GİRİŞ) ---
        // Kullanıcının isminden otomatik mail üretip arka planda kaydediyoruz
        const safeEmail = this.app.username.toLowerCase().replace(/\s/g, '') + "@neuroyks.com";
        const password = "neuroyks_sifre_123";
        
        document.getElementById('user-greeting').innerText = `Veritabanına Bağlanılıyor...`;
        
        // Önce giriş yapmayı dene
        let authRes = await this.app.db.login(safeEmail, password);
        if(!authRes || !authRes.success) {
            // Giriş başarısızsa (kullanıcı yoksa) kayıt ol
            authRes = await this.app.db.register(this.app.username, safeEmail, password, target);
        }
        
        // Karşılama ekranı yazısını OOP üzerinden hedefe basma
        document.getElementById('user-greeting').innerText = `Nasıl gidiyor, ${this.app.username}?`;
        document.getElementById('target-subtitle').innerText = `${target === 'BOTH' ? 'TYT + AYT' : target} Modu Aktif`;
        document.getElementById('badge-display').innerText = target === 'BOTH' ? 'TYT/AYT' : target;
        
        document.getElementById('onboarding-view').classList.remove('active');
        
        // Animasyon geçiş süresi kadar bekle ve ana sistemi çağır
        setTimeout(async () => {
            document.getElementById('onboarding-view').classList.add('hidden');
            document.getElementById('main-view').classList.remove('hidden');
            document.getElementById('main-view').classList.add('active');
            
            // Dashboard nesnesine ait fonksiyonların ASENKRON tetiklenmesi
            await this.app.dashboard.buildDashboard();
            await this.app.dashboard.calculateAnalysis();
        }, 300);
    }
}
