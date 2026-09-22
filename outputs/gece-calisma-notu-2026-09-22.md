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


## 2026-09-23 Search Console manuel dışa aktarma analizi
Kaynak:
- Kullanıcının Google Search Console'dan dışa aktardığı `drbeyazesyaservisi.com-Performance-on-Search-2026-09-23.xlsx`.
- Filtre: Web, Son 28 gün.
- Ekranda görünen son veri tarihi: 2026-09-20.

Özet:
- 31 tıklama, yaklaşık 2.26 bin gösterim, CTR %1.4, ortalama konum 11.4.
- Anasayfa: 30 tıklama / 1755 gösterim / CTR %1.71 / ortalama konum 2.62. Tıklamaların neredeyse tamamı anasayfada.
- Mobil: 23 tıklama / 1832 gösterim / CTR %1.26 / ortalama konum 5.03.
- Yüksek niyetli sıfır tıklamalı sorgular arasında: `pendik buzdolabı servisi` (56 gösterim, konum 2.8), `tuzla buzdolabı tamircisi` (43, 1.19), `pendik beyaz eşya servisi` (42, 5.4), `pendik buzdolabı tamircisi` (33, 1.52), `çamaşır makinesi tamircisi` (33, 1.52).
- Sorgu dışa aktarımı toplam tıklamaların yalnızca bir bölümünü satır bazında gösteriyor; kararlar yalnızca tek sorguya değil sayfa + sorgu desenine göre alındı.
- `hizmetler.html`: 36 gösterim / 0 tıklama / ortalama konum 7.92. Mevcut title çok genel, description ise yalnız Pendik ve Kurtköy diyordu; işletmenin güncel 4 bölgesiyle tutarsızdı.

Uygulanan değişiklik:
- `hizmetler.html` title: `Beyaz Eşya Servisi Hizmetleri | Pendik, Kurtköy, Tuzla, Kartal`
- Description: Pendik, Kurtköy, Tuzla ve Kartal ile ana cihaz kategorilerini açıkça kapsayacak şekilde güncellendi.
- OG/Twitter metadata ve CollectionPage adı aynı metinle tutarlı hale getirildi.
- Commit: `9c3748fe1ea79b6ad5ef5eb66b3229c860a21e2f`

Bilerek değiştirilmedi:
- Anasayfa title/meta: 2026-09-11'de yakın zamanda SEO düzenlemesi yapılmış ve şu anda 30/31 tıklamayı topluyor; yeni etki ölçülmeden yeniden değiştirilmedi.
- Cihaz sayfası title'ları: 2026-09-12'de kısaltılmış; henüz tekrar oynanmadı.
- Pendik/Tuzla/Kurtköy bölge sayfaları: 2026-09-10'da güçlendirilmiş; query→page eşleşmesi olmadan yeniden değiştirilmedi.
- `*-hizmetler.html` ve `*-beyaz-esya-servisi.html` çiftlerinin olası sorgu çakışması not edildi; query→page verisi olmadan canonical/merge yapılmadı.

Sıradaki ölçüm:
- En az 7-14 günlük yeni veri geldikten sonra aynı Son 28 gün raporunu tekrar dışa aktar.
- Özellikle `hizmetler.html` CTR/konum ve anasayfanın yüksek niyetli sorgularını izle.
- Query→page eşleşmesini netleştirmek için Search Console'da kritik sorgulara tek tek filtre uygulayıp Sayfalar sekmesini kontrol et.


## 2026-09-23 query→page doğrulaması: pendik buzdolabı servisi
Search Console ekran doğrulaması:
- Sorgu: `pendik buzdolabı servisi`
- Son 28 gün.
- Anasayfa: 55 gösterim, 0 tıklama, CTR %0, ortalama konum 1.2.
- `pendik-hizmetler.html`: 1 gösterim, 0 tıklama, ortalama konum 90.
- `buzdolabi-servisi.html` bu sorguda görünür satır olarak çıkmadı.

Yorum:
- Google sorguyu esas olarak anasayfayla eşleştiriyor; özel cihaz sayfasına yönlendirme sinyali zayıf.
- Anasayfanın title/meta alanı değiştirilmedi; mevcut sıralama sinyali korunarak düşük riskli iç bağlantı ve sayfa gövdesi optimizasyonu yapıldı.

Uygulanan değişiklikler:
- `buzdolabi-servisi.html`: H1 `Pendik Buzdolabı Servisi` yapıldı; ilk paragraf Pendik başta olmak üzere Kurtköy, Tuzla ve Kartal hizmet kapsamını doğrulanmış şekilde belirtiyor.
- `index.html`: buzdolabı kartındaki genel CTA `Pendik Buzdolabı Servisi →` oldu.
- `pendik-beyaz-esya-servisi.html`: CTA `Pendik Buzdolabı Servisi →` oldu.
- `pendik-hizmetler.html`: CTA `Pendik Buzdolabı Servisi →` oldu.
- `hizmetler.html`: genel CTA `Buzdolabı Servisi →` oldu.
- Title/meta alanları bu adımda tekrar değiştirilmedi.

Commitler:
- `1389d9475c5be9a25ba1e5cf7cae3e6da9a2800b` — Clarify Pendik intent on refrigerator service page
- `8b13bfebbb97fe4169ee62b7f337eae4efd3b589`
- `1abf92bd2ca7193fde6424a1a939e3f3aee79c46`
- `63a966289b6dad2528887dc5eac76209cac5dd40`
- `bec01376874c1dfbf1a8eb1311672e215a03d8c2` — internal anchor updates

Kontrol:
- Güncel main dosyaları yeniden okundu.
- H1 ve tüm hedef anchor metinleri doğrulandı.
- Sonraki ölçümden önce aynı sorgu için yeni title/meta değişikliği yapılmayacak.


## 2026-09-23 query→page doğrulaması: tuzla buzdolabı tamircisi
Search Console ekran doğrulaması:
- Sorgu: `tuzla buzdolabı tamircisi`
- Son 28 gün.
- Anasayfa: 43 gösterim, 0 tıklama, CTR %0, ortalama konum 1.2.
- Başka sayfa görünür satır olarak çıkmadı; özel `tuzla-buzdolabi-servisi.html` sorguda eşleşmiyor.

Yorum:
- Google sorguyu anasayfayla eşleştiriyor.
- Özel Tuzla buzdolabı sayfası mevcut ancak “tamir” arama niyetini metadata ve ilk paragrafta yeterince açık taşımıyordu.
- Anasayfanın title/meta alanı değiştirilmedi; mevcut sıralama korunarak hedef sayfa ve ona giden iç linkler güçlendirildi.

Uygulanan değişiklikler:
- `tuzla-buzdolabi-servisi.html` title: `Tuzla Buzdolabı Servisi ve Tamiri | Dr. Beyaz Eşya Servisi`
- Meta description ve hero ilk paragrafında `buzdolabı servisi ve tamiri` ifadesi doğal biçimde eklendi.
- `tuzla-beyaz-esya-servisi.html` ve `tuzla-hizmetler.html` iç bağlantı metinleri `Tuzla Buzdolabı Servisi →` olarak netleştirildi.

Commitler:
- `d3fa0b8b23ba238952fc776cc4813b2f759d751f` — Align Tuzla refrigerator page with repair search intent
- `09cf1dec76c6dc3b092b263ff71c332f272cddf4`
- `e43672157a923803eb355515abcde2771ab904c1` — Strengthen Tuzla refrigerator internal anchors

Kontrol:
- Güncel main dosyaları tekrar okundu.
- Yeni title/description ve hedef anchor metinleri doğrulandı.
- Bu sorgu için yeni veri gelmeden tekrar title/meta değişikliği yapılmayacak.


## 2026-09-23 gece başlangıç — mevcut GSC dışa aktarımından ek optimizasyonlar
Veri kaynağı:
- Aynı manuel Search Console dışa aktarımı kullanıldı; yeni rapor sorgulanmadı.
- Son 28 gün sorgularında yüksek niyetli ve sıralaması güçlü fakat tıklamasız kümeler:
  - `çamaşır makinesi tamircisi`: 33 gösterim, konum 1.52
  - `çamaşır makine tamircisi`: 13 gösterim, konum 1.54
  - `çamaşır makinesi servisi`: 9 gösterim, konum 1.44
  - `bulaşık makinesi tamircisi`: 13 gösterim, konum 1.46
  - `derin dondurucu tamircisi`: 13 gösterim, konum 1.23
  - `fırın tamircisi`: 5 gösterim, konum 2.0
  - `set üstü ocak tamircisi`: 4 gösterim, konum 1.25

Uygulanan düşük riskli sayfa sinyalleri:
- Yakın zamanda değişen title/meta alanlarına yeniden dokunulmadı.
- `camasir-makinesi-servisi.html` H1 = `Pendik Çamaşır Makinesi Servisi`; ilk paragraf Pendik ve doğrulanmış hizmet bölgeleriyle birlikte doğal `tamiri` niyetini açıklıyor.
- `bulasik-makinesi-servisi.html` H1 = `Pendik Bulaşık Makinesi Servisi`.
- `derin-dondurucu-servisi.html` H1 = `Pendik Derin Dondurucu Servisi`.
- `firin-ocak-servisi.html` H1 = `Pendik Fırın ve Ocak Servisi`.
- Anasayfa, Pendik yerel sayfası ve Pendik hizmet hub'ındaki genel `Hizmeti/Servis bilgilerini incele` anchor'ları ilgili cihaz servis adlarıyla değiştirildi.
- Genel `hizmetler.html` sayfasındaki dört cihaz CTA'sı açıklayıcı servis adlarına dönüştürüldü.
- Telefon, WhatsApp ve mobil sabit iletişim çubuklarının bu sayfalarda mevcut olduğu tekrar doğrulandı.

Commitler:
- `7840ed6d755dcc3becadfb39571f6081848740b6`
- `79fc4112019000c4f9ae0d07e4e379ee1e94d2be`
- `932be0f2c20416bfd8f8475cfc0ea00721e2fd2b`
- `cc948f11ae72a5b0ba49560f10da345001273795`
- `f3473448140a20dc3b763ad49db039ff6b8c2cae`
- `a700e09e7afe74e7083052d63a1362182934599b`
- `dc6ddd97f937268b33f877150c55d539e5b96253`
- `381814aace60391cdaec794230c41e7b36e41261`

### Canonical homepage alias temizliği
GSC sayfa raporunda hem `/` hem `/index.html`, ayrıca `/en/` ve `/en/index.html` ayrı satırlar olarak görünüyordu.
- Sitemap zaten yalnız canonical kök URL'leri kullanıyor.
- Ana sayfaların canonical etiketleri doğruydu; ancak hreflang ve sayfa içi home linkleri `index.html` alias'larını işaret ediyordu.
- Türkçe ana sayfada hreflang artık TR = `https://drbeyazesyaservisi.com/`, EN = `https://drbeyazesyaservisi.com/en/`, x-default = kök URL.
- İngilizce ana sayfada da aynı canonical hreflang eşleşmesi uygulandı.
- Her iki ana sayfadaki kendi home/locale bağlantılarında `index.html` alias kullanımı kaldırıldı.
- Canonical URL'ler değişmedi.

Commitler:
- `b9b5406828009238464f14213ce4d398ead7dab5`
- `c11c587e92b5b21fef3ceae90a352d25f7c0c21e`

Kontrol:
- Türkçe ve İngilizce ana sayfa tekrar okundu.
- Canonical ve hreflang URL'leri birbirleriyle uyumlu.
- Bu iki sayfada `index.html` alias href kalmadı.
- Yeni veri gelmeden bu yeni cihaz H1/iç bağlantı düzenlemeleri tekrar değiştirilmeyecek.


### High-intent sayfalarda /index.html iç link konsolidasyonu
- GSC sayfa raporundaki `/index.html` alias görünürlüğünü azaltmak için, yalnız bu gece üzerinde çalışılan yüksek niyetli servis ve bölge sayfalarında ana sayfa iç linkleri canonical `/` URL'sine çevrildi.
- Değişen 11 sayfa: `hizmetler.html`, `pendik-hizmetler.html`, `pendik-beyaz-esya-servisi.html`, `buzdolabi-servisi.html`, `camasir-makinesi-servisi.html`, `bulasik-makinesi-servisi.html`, `derin-dondurucu-servisi.html`, `firin-ocak-servisi.html`, `tuzla-hizmetler.html`, `tuzla-beyaz-esya-servisi.html`, `tuzla-buzdolabi-servisi.html`.
- Her sayfada 3 adet `href="index.html"` bağlantısı `href="/"` olarak değişti.
- Telefon ve WhatsApp linklerinin değişiklik sonrası mevcut olduğu doğrulandı.
- Tek commit: `b8760c7fcf628834a2b46ff72e9a61e674e01a2a` — Consolidate canonical home links on service pages.


## 2026-09-23 dönüşüm erişimi ve canonical bağlantı devamı
### Arıza rehberlerinde eksik WhatsApp / mobil bar
Denetimde 8 cihaz arıza rehberinin telefon linki taşıdığı ancak WhatsApp ve sabit mobil `Ara / WhatsApp` çubuğu taşımadığı görüldü:
- `bulasik-makinesi-ariza-rehberi.html`
- `buzdolabi-ariza-rehberi.html`
- `camasir-makinesi-ariza-rehberi.html`
- `derin-dondurucu-ariza-rehberi.html`
- `firin-ariza-rehberi.html`
- `klima-ariza-rehberi.html`
- `kombi-ariza-rehberi.html`
- `kurutma-makinesi-ariza-rehberi.html`

Uygulama:
- Hero bölümüne doğrudan WhatsApp erişimi eklendi.
- Mobil sabit `Ara / WhatsApp` çubuğu eklendi.
- Mevcut telefon erişimi korundu.
- Ana sayfa linkleri `index.html` yerine canonical `/` oldu.
- Footer hizmet bölgesi metni Pendik • Kurtköy • Tuzla • Kartal olarak güncellendi.
- Commit: `efd09bfe69e3516281249a75aa0b15cc4b171031`.

Doğrulama:
- 8 sayfanın tamamı yeniden okundu.
- Telefon = mevcut, WhatsApp = mevcut, mobil sabit bar = mevcut.
- Ayrıca 21 belirti/arıza detay sayfası örneklem değil tam liste olarak denetlendi; telefon, WhatsApp ve mobil bar bu 21 sayfanın tamamında zaten mevcuttu, tekrar değişiklik yapılmadı.

### GSC'de görünür diğer sayfalarda canonical home link temizliği
- GSC sayfa raporunda görünür üst sayfalarda kalan `href="index.html"` home linkleri canonical `/` hedefiyle değiştirildi.
- İlk ek paket commit: `cde12bfad571008fe16bedba86d32b7652ac8281`.
- İkinci ek paket commit: `fe03332e210373ff5e75c0890ff9f77957012a29`.
- İngilizce GSC sayfalarında kendi home bağlantıları `/en/`, Türkçe dönüş bağlantıları `/` olarak konsolide edildi.
- İngilizce paket commit: `b9d35cb579daa2dbca53bfe41a8f5d38f4111efd`.

Not:
- Bu değişiklikler canonical hedefleri değiştirmedi; yalnız sayfa içi bağlantıları zaten tanımlı canonical URL'lerle uyumlu hale getirdi.
