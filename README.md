# NeuroYKS - YKS Akıllı Çalışma Asistanı

Bu proje, YKS (TYT/AYT) öğrencileri için geliştirilmiş, "Aralıklı Tekrar" (Spaced Repetition) destekli, nesne yönelimli (OOP) mimariye sahip bir eğitim teknolojisi uygulamasıdır. 

## Proje Mimarisi

*   **Frontend (Ön Yüz):** HTML5, Vanilla CSS (Glassmorphism Tasarım), Vanilla JavaScript (OOP Yapısı)
*   **Backend (Arka Yüz):** Node.js, Express.js
*   **Veritabanı:** MongoDB (Mongoose ORM)
*   **Güvenlik:** JWT tabanlı kimlik doğrulama, bcrypt şifreleme.

## Kurulum ve Çalıştırma

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin.

### 1. Backend (Sunucu) Kurulumu
1. Terminalden `backend` klasörüne girin: `cd backend`
2. Gerekli paketleri indirin: `npm install`
3. Eğer `.env` dosyanız yoksa `.env` dosyası oluşturup içine MongoDB bilgilerinizi girin.
4. Veritabanını ÖSYM tarzı örnek sorularla doldurmak için: `node seeder_pro.js`
5. Sunucuyu başlatın: `npm start` (Sunucu 5000 portunda çalışacaktır).

### 2. Frontend (Ön Yüz) Çalıştırma
Backend sunucusu çalışırken (terminali kapatmadan), `frontend/public/index.html` dosyasını tarayıcınızda açın.

## Klasör Yapısı
*   **`backend/`**: Node.js sunucu kodları, API rotaları (routes), denetleyiciler (controllers) ve veritabanı modelleri.
*   **`frontend/`**: Kullanıcı arayüzü kodları. OOP tasarımına göre `components`, `pages` ve `services` olarak parçalara ayrılmıştır.
