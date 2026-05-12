# NeuroYKS - Aralıklı Tekrar ve Sınav Asistanı

## Projenin Amacı ve İşleyişi
NeuroYKS, üniversiteye hazırlanan öğrencilerin (TYT/AYT) öğrenme yanılsamasını (Illusion of Competence) engellemek ve çalıştıkları bilgileri uzun süreli belleğe (Long-term Memory) aktarmak amacıyla **Aralıklı Tekrar (Spaced Repetition)** sistemini kullanan akıllı bir test uygulamasıdır.

Öğrenci girdiği zaman hedef sınavını belirler. İlgili ders ve alt başlıklar yapay zeka tarafından hazırlanan YKS uyumlu soru bankalarından anlık puan hesabı yapılarak ekrana gelir.

## Nesne Yönelimli Programlama (OOP) ve Mimari (Component-Based)
Ödev gerekliliklerinize ve modern React mimarilerine (Frontend Architecture) uyumlu olması için Vanilla JS kullanılmasına rağmen kod bütünü **Class (Sınıf)** yapısına çevrilip modülerleştirilmiştir.

Klasör yapısı işleyişi:
* **`public/index.html`:** Uygulamanın kapısıdır. Görseller (DOM) bu dosyaiçinde tutulur. OOP mimarisindeki JS sınıflarını `<script>` etiketleriyle içe çeker.
* **`src/services/DataService.js`:** Uygulamanın Veritabanı ve API erişim simülasyonunu yapan sınıftır. Gerekli JSON/Veri havuzu burada barınır.
* **`src/pages/` (Dashboard, Onboarding):** Sistemde Sayfa düzeyinde mantık içeren yapılar bu klasördeki sınıflarda tutulur. (Örn: Sınavı TYT/AYT filtreleme).
* **`src/components/` (Navigation, Quiz):** Sayfaların içerisindeki bağımsız yapılar *(Örneğin sorunun açılıp şıkların gösterilmesi ve cevaplanması)* bu sınıflarda yazılmıştır. Modülerlik artırılmıştır.
* **`src/App.js`:** Bütün bağımsız sınıfları ve state (uygulama durumunu) kendi içinde Dependency Injection felsefesiyle birleştirir.
* **`src/index.js`:** Uygulamayı new keyword'ü ile türetip ayağa kaldırır. 

Bu sayede tüm iş parçacıkları nesne mantığı içinde ayrılmış ve projenin kontrolü ve devamlılığı kusursuzlaştırılmıştır. Yüz binlerce satırlık veri eklendiğinde bile proje kolayca yönetilebilir.
