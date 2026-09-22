# Gece çalışma notu — 2026-09-22

## Başlangıç
- İstenen `outputs/gece-calisma-notu-2026-09-20.md` ve `outputs/uygulanmamis-plan-2026-09-21.md` ana dalda ve mevcut diğer dallarda bulunamadı.
- Son commitlerde telefon/WhatsApp dönüşüm takibi, hata kodu kaynak doğrulamaları, gerçek servis fotoğrafları ve GA4 bağlantısı zaten mevcut; tekrar edilmedi.

## Veri engeli
- GSC Wizard `payment_required` döndürdü.
- Ücretli işlem, reset kredisi veya limit aşma denemesi yapılmadı.
- Yeni GSC raporu alınamadığı için CTR/title/meta değişikliği yapılmadı.

## Düzeltme
- `ariza-rehberi.html` sayfasında eksik olan sabit mobil iletişim çubuğu eklendi.
- Telefon ve WhatsApp erişimi mobilde doğrudan kullanılabilir hale getirildi.
- Form veya müşteri eleme adımı eklenmedi.
- Commit: `a3831467e4e4ffe32a560092649cc5bc21a68dbe`

## Test
- Güncel dosya yeniden okundu.
- `.mobile-actions`, telefon bağlantısı ve WhatsApp bağlantısı doğrulandı.
- Commit status listesi boş; ayrı CI kontrolü yok.
- Canlı alan adı bu oturumun web fetch aracıyla açılamadığı için alan adı üzerinden son HTML doğrulaması yapılamadı.

## Bekleyenler
1. GSC erişimi abonelik engelinde.
2. 2026-09-20 ve 2026-09-21 notları depoda bulunamadı.
3. Canlı domain fetch doğrulaması araç erişimi nedeniyle engelli.

## Ek teknik kontrol
- Ana sayfa, hizmetler, 4 bölge sayfası, 8 ana cihaz sayfası, arıza rehberi, hata kodları ve iletişim dahil 17 yüksek niyetli sayfanın yerel .html bağlantıları depo dosya listesiyle karşılaştırıldı.
- Bu grupta kök dizine giden kırık yerel .html bağlantısı bulunmadı.
- Bölge ve cihaz sayfalarında telefon, WhatsApp, mobil iletişim çubuğu ve ortak site-ui yüklemesi mevcut; arıza rehberindeki eksik mobil çubuk bu çalışmada kapatıldı.

## Sıradaki adım
- GSC erişimi geldiğinde aynı raporu aynı gün tekrarlamadan 28 günlük query+page verisiyle yüksek niyetli bölge/cihaz sayfalarını önceliklendir.
- Yeni veri gelene kadar title/meta metinlerini tekrar değiştirme.


## 2026-09-23 anasayfa görsel düzeltmesi
Sorun:
- Anasayfadaki "Gerçek Servis Çalışmaları" kartlarında CSS Grid satır yüksekliği nedeniyle kısa kartlar satır yüksekliğine esniyor ve figcaption altında boş gri alan görünüyordu.
- Çamaşır makinesi kontrol paneli fotoğrafı anasayfada birden fazla görünür alanda tekrar ediyordu.

Değişiklikler:
- `assets/site-refinements.css`: `.real-work-grid` için `align-items:start` eklendi; kartların satır yüksekliğine zorla esnemesi engellendi.
- `index.html`: Gerçek çalışma kartındaki tekrar eden `camasir-makinesi-servis-19.jpeg` yerine gerçek servis arşivindeki `camasir-makinesi-servis-20.jpeg` kullanıldı.
- `index.html`: Çamaşır makinesi hizmet kartı da ayrı bir gerçek servis görseli olan `camasir-makinesi-servis-23.jpeg` ile değiştirildi. Böylece `servis-19`, `servis-20` ve `servis-23` anasayfada birer kez kullanılıyor.

Commitler:
- `75dbe6ef53d42627a6d603e66ab58c6b6716d306` — Fix uneven real-work card stretching
- `ba97db3f7786c9c6a5047ce80e4b919c90c6f338` — Replace duplicate homepage service photo
- `547a4836362d65f9c90b42396e1e0ac97422b7c5` — Use distinct washing machine photo on homepage

Doğrulama:
- CSS kuralı main dalında tekrar okundu ve `align-items:start` mevcut.
- Anasayfada ilgili üç çamaşır makinesi görselinin her biri bir kez kullanılıyor.
- Yeni görsellerin intrinsic boyutları doğrulandı: servis-20 = 1200×1600, servis-23 = 1600×1200.
