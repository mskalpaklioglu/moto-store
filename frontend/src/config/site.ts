// Central, rebrandable storefront configuration. Replace values here; components read from this file.
import hero from "@/assets/hero.jpg";
import bannerTech from "@/assets/banner-tech.jpg";
import bannerSeason from "@/assets/banner-season.jpg";

export const siteConfig = {
  name: "MARKA",
  tagline: "Motosiklet Aksesuarları",
  logoText: { main: "MARKA", suffix: "moto" },
  announcement: {
    enabled: true,
    text: "Demo mağaza — fiyatlar, stoklar ve kampanyalar örnek verilerdir.",
    link: { label: "Ürünlere göz atın", to: "/urunler" as const },
  },
  contact: {
    email: "destek@ornek-alan-adi.com",
    phone: "+90 (000) 000 00 00",
    hours: "Hafta içi 09:00 – 18:00 (örnek)",
    address: "Adres bilgisi eklenecek",
  },
  social: [
    { label: "Instagram", href: "#" },
    { label: "YouTube", href: "#" },
    { label: "X", href: "#" },
  ],
  hero: {
    image: hero,
    imageAlt: "Gün batımında sahil yolunda motosikletinin yanında duran kasklı sürücü",
    eyebrow: "Yeni sezon seçkisi",
    title: "Yolda her detay\nyerli yerinde.",
    text: "Kasktan navigasyona, sürüşünüzü daha güvenli ve keyifli kılan aksesuarları özenle seçiyoruz.",
    primary: { label: "Ürünleri Keşfet", to: "/urunler" as const },
    secondary: { label: "Kategorileri İncele", to: "/kategoriler" as const },
  },
  banners: [
    {
      id: "tech",
      eyebrow: "Seçili koleksiyon",
      title: "Kokpitinizi bağlayın",
      text: "Telefon tutucular, CarPlay ekranlar ve interkomlar tek bir seçkide.",
      image: bannerTech,
      imageAlt: "Gidona monte navigasyon ekranı ve telefon tutucu, arka planda şehir silüeti",
      cta: { label: "Koleksiyonu gör", category: "carplay-navigasyon" },
    },
    {
      id: "season",
      eyebrow: "Sezon kampanyası (örnek)",
      title: "Uzun yollara hazırlık",
      text: "Aydınlatma ve koruma ekipmanlarında sezon seçkisi. Kampanya içeriği örnektir.",
      image: bannerSeason,
      imageAlt: "Sonbaharda dağ yolunda iki macera motosikleti",
      cta: { label: "Seçkiyi incele", category: "aydinlatma" },
    },
  ],
  promo: {
    eyebrow: "Sezon açılışı (örnek)",
    title: "Kask ve interkomda %10 indirim",
    text: "ORNEK10 koduyla en az ₺1.500 tutarındaki sepetlerde geçerli. Kampanya demo amaçlıdır.",
    code: "ORNEK10",
    endsAt: "2026-11-30T23:59:00",
    image: bannerSeason,
    cta: { label: "Kask ve korumalar", category: "kask-koruma" },
  },
  // Only state things that are true of this site by design. Update once policies and providers are confirmed.
  trust: [
    {
      icon: "truck",
      title: "Şeffaf kargo",
      text: "Kargo ücreti ödeme öncesinde net olarak gösterilir.",
    },
    { icon: "shield", title: "Güvenli alışveriş", text: "Kart bilgileriniz bu sitede saklanmaz." },
    {
      icon: "rotate",
      title: "Açık iade koşulları",
      text: "İade ve değişim koşulları sitede ayrı sayfada yayımlanır.",
    },
    {
      icon: "headset",
      title: "Destek",
      text: "Sorularınız için iletişim sayfasından bize yazabilirsiniz.",
    },
  ],

  footer: {
    columns: [
      {
        title: "Kurumsal",
        links: [
          { label: "Hakkımızda", slug: "hakkimizda" },
          { label: "İletişim", slug: "iletisim" },
        ],
      },
      {
        title: "Yardım",
        links: [
          { label: "Kargo ve Teslimat", slug: "kargo-ve-teslimat" },
          { label: "İade ve Değişim", slug: "iade-ve-degisim" },
        ],
      },
      {
        title: "Sözleşmeler",
        links: [
          { label: "Gizlilik Politikası", slug: "gizlilik-politikasi" },
          { label: "KVKK", slug: "kvkk" },
          { label: "Mesafeli Satış Sözleşmesi", slug: "mesafeli-satis-sozlesmesi" },
          { label: "Ön Bilgilendirme Formu", slug: "on-bilgilendirme-formu" },
        ],
      },
    ],
  },
  shipping: {
    freeShippingThreshold: null as number | null, // set when policy is decided
    flatEstimate: 89.9, // placeholder estimate, recalculated by backend
  },
} as const;

export const infoPages: Record<string, { title: string; intro: string }> = {
  hakkimizda: {
    title: "Hakkımızda",
    intro: "Marka hikâyesi ve ekibimiz hakkında bilgiler yakında burada yer alacak.",
  },
  iletisim: {
    title: "İletişim",
    intro: "İletişim bilgilerimiz kesinleştiğinde bu sayfada yayımlanacaktır.",
  },
  "kargo-ve-teslimat": {
    title: "Kargo ve Teslimat",
    intro: "Kargo firmaları, ücretler ve teslimat süreleri belirlendiğinde burada açıklanacaktır.",
  },
  "iade-ve-degisim": {
    title: "İade ve Değişim",
    intro: "İade ve değişim koşulları yayımlanmadan önce hukuki inceleme yapılacaktır.",
  },
  "gizlilik-politikasi": {
    title: "Gizlilik Politikası",
    intro: "Bu sayfa bir yer tutucudur; nihai metin hukuki danışmanlık sonrası eklenecektir.",
  },
  kvkk: {
    title: "KVKK Aydınlatma Metni",
    intro: "Bu sayfa bir yer tutucudur; nihai metin hukuki danışmanlık sonrası eklenecektir.",
  },
  "mesafeli-satis-sozlesmesi": {
    title: "Mesafeli Satış Sözleşmesi",
    intro: "Bu sayfa bir yer tutucudur; nihai metin hukuki danışmanlık sonrası eklenecektir.",
  },
  "on-bilgilendirme-formu": {
    title: "Ön Bilgilendirme Formu",
    intro: "Bu sayfa bir yer tutucudur; nihai metin hukuki danışmanlık sonrası eklenecektir.",
  },
};
