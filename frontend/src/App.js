/**
 * Sınıf Sorumluluğu: Tüm Sınıfları bir araya getiren "Ana Yönetici" sınıfıdır.
 * Nesne Yönelimli Programlamanın (OOP) kalbidir. 
 * State (Uygulama Durumu) genellikle burada veya veritabanında saklanır.
 */
class App {
    constructor() {
        // Global State (Uygulama Durumları)
        this.username = "";
        this.userTarget = "BOTH";
        this.toastTimeout = null;

        // --- DEPENDENCY INJECTION (Bağımlılıkların Eklenmesi) ---
        // Uygulamanın farklı modülleri, new anahtar kelimesi ile sınıflardan türetilir.
        this.db = new DataService();
        this.nav = new Navigation(this);
        this.quiz = new QuizComponent(this);
        this.dashboard = new DashboardPage(this);
        this.onboarding = new OnboardingPage(this);
        
        console.log("NeuroYKS Core Componentleri OOP standardında yüklendi.");
    }

    /**
     * Tüm modüllerde ortak kullanılabilecek şık tasarım sistem uyarısı/mesajı sistemi
     */
    showToast(title, msg) {
        const toast = document.getElementById('toast');
        toast.querySelector('h4').innerText = title;
        toast.querySelector('#toast-message').innerText = msg;
        
        toast.classList.remove('show');
        clearTimeout(this.toastTimeout);
        
        setTimeout(() => { 
            toast.classList.add('show'); 
            this.toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000); 
        }, 50);
    }
}
