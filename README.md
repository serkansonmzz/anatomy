# Anatomy

Türkçe arayüzlü, gerçek zamanlı 3D şematik insan anatomisi atlası.

63 seçilebilir yapı; 11 vücut sistemi; 22 seçilebilir erkek/kadın üreme yapısı ve iç kesit görünümü; organ bilgileri, ilişkiler, odaklama, izolasyon, katman görünürlüğü, etiketler, kalıcı tarayıcı yer imleri ve altı duraklık rehberli tur.

Kurulumsuz kullanım: `dist/Anatomy.html` dosyasını indirip tarayıcıda açın. Three.js, geometriler, içerik ve arayüz tek dosyanın içindedir. İnternet olmadan da çalışır; Google Fonts yüklenmezse sistem fontu kullanılır. WebGL desteklenmeyen cihazlarda aynı geometriyi kullanan Canvas 2D tabanlı bir 3D çizim yolu devreye girer.

Geliştirme: Statik uygulama `dist/` altında. `index.html` için bir statik HTTP sunucusu kullanın. ES modülleri kullanan bu kaynak giriş noktası `file://` ile açılmaz. Three.js 0.170.0 ve OrbitControls yerel olarak dahil edilmiştir. Düzenlemeden sonra `python3 scripts/bundle-standalone.py` tek dosya sürümünü yeniler.

Model bu proje için geometrik olarak oluşturulmuştur. Tüm organları, tüm damar dallarını veya bütün küçük kemikleri temsil etmez. Damarlar, bazı şekil ve konumlar basitleştirilmiştir. Klinik kullanım için uygun değildir. İçerik referansı: OpenStax Anatomy and Physiology 2e. Three.js MIT lisansı: `dist/vendor/THREE-LICENSE.txt`.

Klavye: `/` ara, `R` görünümü sıfırla, `Esc` odaktan çık. Yer imleri yalnızca bu tarayıcıda tutulur.

Doğrulanan akışlar: organ araması, modelden tıklayarak karaciğer seçimi, böbrek izolasyonu ve kamera odağı, kaydetme ve sayfa yenilemesinde kalıcılık, kadın üreme organlarına geçiş, rehberli tur adımları, dolaşım katmanı, sürükleyerek 3D döndürme ve tek dosya sürümünün açılması. Test tarayıcısında WebGL kapalı olduğundan görsel testler yazılımsal çizim yolu üzerinden yapıldı; GPU görünümü burada doğrulanamadı.

## Üreme sistemini inceleme

Soldan Üreme sistemi seçin. Erkek/Kadın düğmeleriyle anatomiyi değiştirin. Pelvise odaklan düğmesi bölgeyi yakınlaştırır. İç yapıları aç ile ön duvarları kaldırıp tübülleri, testis ağını, erektil dokuları, rahim katmanlarını ve folikülleri görebilirsiniz. Listeden veya modelden yapıya tıklayarak bilgilerine ulaşabilirsiniz. Kesit, şematik bir ön görünüm sunar.

## Geliştirme ve yayın

Kaynaklar ayrı HTML, CSS ve ES modülleridir; Three.js yerel olarak vendor klasöründedir. Harici bir backend veya veritabanı gerekmez.

```sh
npm run check
npm test
npm run build
python3 -m http.server 8000 --directory dist
```

GitHub Settings → Pages → Source: GitHub Actions seçilir. `main` dalına her push, kontrolleri ve geometri testlerini çalıştırır, tek dosya sürümünü üretir ve `dist` klasörünü GitHub Pages'e yayınlar. Pull requestlerde yalnızca kontroller çalışır. Yayınlanan sitenin `Anatomy.html` dosyası çevrimdışı kullanım için indirilebilir.

Üreme anatomisi kaynakları:
- https://openstax.org/books/anatomy-and-physiology-2e/pages/27-1-anatomy-and-physiology-of-the-testicular-reproductive-system
- https://openstax.org/books/anatomy-and-physiology-2e/pages/27-2-anatomy-and-physiology-of-the-ovarian-reproductive-system
