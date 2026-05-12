/**
 * PROJENİN GİRİŞ NOKTASI (ENTRY POINT)
 * public/index.html dosyası tarayıcı tarafından okunduğunda bu dosya çalışır
 * ve ana App sınıfını örnekleyip uygulamayı ayağa kaldırır.
 */

const NeuroApp = new App();

// Frontend'de vanilla JS kullanıldığı için HTML içindeki onclick eventlerinin
// yeni OOP nesnelerini görebilmesi adına 'window' nesnesine kaydedilir.
window.NeuroApp = NeuroApp;

console.log("🚀 Uygulama başlatıldı! Bütün sistemler hazır.");
