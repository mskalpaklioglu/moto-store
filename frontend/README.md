# Motosiklet Aksesuarları E-Ticaret — Frontend

Türkçe, TL bazlı e-ticaret arayüzü + `/admin` yönetim paneli. **Yalnızca frontend**: backend, veritabanı, gerçek kimlik doğrulama ve ödeme yoktur. Tüm veriler demo/mock'tur.

Teknoloji: React 19, TypeScript, TanStack Start/Router (dosya tabanlı rota), TanStack Query, Tailwind CSS v4, react-hook-form + zod, shadcn/Radix bileşenleri, Recharts.

## Kurulum ve çalıştırma

```sh
npm install
npm run dev        # geliştirme sunucusu
npm run build      # production build
npm run lint       # eslint (+ prettier)
npm test           # vitest (birim)
npm run test:e2e   # Playwright uçtan uca (yerel Chrome kullanır)
npx tsc --noEmit   # tip kontrolü
```

## Ortam değişkenleri

| Değişken            | Açıklama                                                                                           |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | Boşsa mock servisler kullanılır. Doluysa (`https://api.ornek.com/`) HTTP servisleri devreye girer. |

Gizli anahtarları frontend koduna veya depoya eklemeyin.

## Marka ve içerik

- Marka adı, logo metni, iletişim, hero, banner'lar, güven unsurları, footer, kargo tahmini: [src/config/site.ts](src/config/site.ts)
- Renkler/tipografi tokenları (turuncu vurgu `--brand`): [src/styles.css](src/styles.css)
- Logo bileşeni: [src/components/layout/Logo.tsx](src/components/layout/Logo.tsx)
- Hukuki/bilgi sayfaları yer tutucudur: `infoPages` (site.ts) ve [bilgi.$slug.tsx](src/routes/_store/bilgi.$slug.tsx). Gerçek işletme bilgileri ve hukuki metinler eklenmeden yayımlanmamalıdır.

## Rotalar

Mağaza (`src/routes/_store/`): `/`, `/urunler`, `/kategoriler`, `/kategori/:slug` (`?alt=`), `/arama?q=`, `/urun/:slug`, `/sepet`, `/odeme`, `/giris`, `/kayit`, `/hesap`, `/hesap/siparisler`, `/hesap/siparisler/:id`, `/hesap/adresler`, `/favoriler`, `/iletisim`, `/sss`, `/bilgi/:slug`.

Listeleme filtreleri URL'de tutulur: `marka`, `min`, `max`, `stok`, `indirim`, `ozellik` (`anahtar:değer`), `sirala`, `sayfa`.

Yönetim (`src/routes/admin*.tsx`): `/admin`, `/admin/urunler`, `/admin/urunler/yeni`, `/admin/urunler/:id`, `/admin/kategoriler`, `/admin/markalar`, `/admin/stok`, `/admin/siparisler`, `/admin/siparisler/:id`, `/admin/musteriler`, `/admin/musteriler/:id`, `/admin/kampanyalar`, `/admin/ayarlar`.

## Mimari

| Konum                        | Görev                                                                                                                 |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `src/types/index.ts`         | Domain tipleri (backend sözleşmesi olarak da kullanılabilir)                                                          |
| `src/data/mock.ts`           | Demo veri (yalnızca servisler import eder)                                                                            |
| `src/services/`              | `catalog`, `commerce` (checkout/auth/account/newsletter), `admin`; her biri bir arayüz + `mock*` + `http*` uygulaması |
| `src/services/api/client.ts` | Merkezi HTTP istemcisi, `ApiRequestError`, `errorMessage`                                                             |
| `src/services/index.ts`      | Servis kaydı: `VITE_API_BASE_URL` yoksa mock, varsa HTTP                                                              |
| `src/hooks/queries.ts`       | Servisleri saran React Query hook'ları                                                                                |
| `src/state/shop.tsx`         | Sepet, kupon, favoriler (localStorage)                                                                                |
| `src/lib/cart.ts`            | Sepet/kupon hesapları (yalnızca gösterim)                                                                             |
| `src/components/`            | `layout`, `product`, `listing`, `checkout`, `admin`, `common`, `ui`                                                   |

## Gerçek backend'e bağlanma

1. `.env` içinde `VITE_API_BASE_URL` tanımlayın. `src/services/index.ts` otomatik olarak `http*` servislerine geçer.
2. Backend'in `src/services/*.ts` içindeki `http*` nesnelerindeki uç noktaları (ör. `/products`, `/checkout`, `/admin/products/:id`) sağlamasını sağlayın veya yolları buradan değiştirin. Hata gövdesi `ApiError` biçiminde (`message`, `fieldErrors`) olmalıdır.
3. Mock'a özgü davranışları kaldırın/değiştirin: `data/mock.ts` (silinebilir), checkout'taki "hata" e-postası tetikleyicisi, `catalog.ts` içindeki istemci tarafı filtre/facet mantığı (backend yapmalı).
4. **Fiyat, stok, kupon ve toplamlar backend'de yeniden hesaplanmalıdır** (`lib/cart.ts`, `findCoupon`, `CheckoutService.submit`). Frontend hesapları yalnızca gösterimdir.
5. Kimlik doğrulama: `AuthService` HTTP uygulaması oturum çerezi ile çalışacak şekilde (`credentials: "include"`) hazırdır; `/hesap` ve `/admin` rotalarına gerçek koruma (yönlendirme + sunucu tarafı yetki) eklenmelidir. Admin arayüzünde şu an erişim kontrolü **yoktur**; demo banner'ı güvenlik mekanizması değildir.
6. Ödeme: `/odeme` yalnızca demo akışıdır; ödeme sağlayıcısı entegrasyonu `CheckoutService.submit` sonucu ve yeni bir ödeme adımıyla yapılmalıdır. Kart verisi asla frontend'de toplanmamalıdır.
7. Görsel yükleme: admin ürün formu dosyaları yüklemez (oturumluk önizleme). Backend/depolama bağlanınca `ProductForm` içindeki dosya seçimi yükleme uç noktasına bağlanmalıdır.

## Bilinen sınırlar

- Giriş/kayıt/şifre sıfırlama, iletişim formu, bülten ve hesap düzenlemeleri doğrulanır ama sunucuya gitmez; kullanıcıya demo olduğu belirtilir.
- Admin değişiklikleri bellekte tutulur, sayfa yenilenince sıfırlanır. Sepet ve favoriler tarayıcıda (localStorage) kalır.
- Ürün görselleri kategori başına tek görseldir (demo); ürün adları, markalar ve teknik değerler kurgusaldır.
- Site ayarları sayfası vitrini canlı değiştirmez (kaynak `site.ts`).
- Ürün/kategori/sipariş görünümleri 3 temel kırılımda test edildi (masaüstü, mobil 390px); tablet için özel düzen ayarı yapılmadı, fluid grid kullanılır.

## Sunum için yayın (GitHub Pages)

`.github/workflows/pages.yml`, `main`'e her gönderimde statik bir demo derler ve GitHub Pages'e yayınlar (adresler `#` ile başlar, ör. `…/moto-store/#/urunler`). Elle denemek için:

```sh
PAGES=1 VITE_STATIC=1 npm run build:pages   # çıktı: dist/client
```

Bu yalnızca sunum içindir (mock verilerle). Gerçek yayın, SSR derlemesi (`npm run build`) ile Cloudflare üzerinde yapılacaktır.
