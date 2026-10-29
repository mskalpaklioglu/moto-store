// DEMO DATA ONLY. Accessed exclusively through src/services/* mock implementations.
// Products, brands and specs below are fictional placeholders, not real-world items.
import helmet from "@/assets/cat-helmet.jpg";
import intercom from "@/assets/cat-intercom.jpg";
import mount from "@/assets/cat-mount.jpg";
import nav from "@/assets/cat-nav.jpg";
import camera from "@/assets/cat-camera.jpg";
import light from "@/assets/cat-light.jpg";
import accessory from "@/assets/cat-accessory.jpg";
import parts from "@/assets/cat-parts.jpg";
import bannerTech from "@/assets/banner-tech.jpg";
import bannerSeason from "@/assets/banner-season.jpg";
import hero from "@/assets/hero.jpg";
import type {
  Article,
  Brand,
  Campaign,
  Category,
  Customer,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  ProductVariant,
  Review,
  StockMovement,
  StockStatus,
  VariantOption,
} from "@/types";

const sub = (parentId: string, items: [string, string][]): Category[] =>
  items.map(([slug, name], i) => ({
    id: `${parentId}-${slug}`,
    slug,
    name,
    parentId,
    sortOrder: i,
  }));

export const categories: Category[] = [
  {
    id: "c1",
    slug: "kask-koruma",
    name: "Kask ve Koruma Ekipmanları",
    image: helmet,
    sortOrder: 1,
    children: sub("c1", [
      ["kasklar", "Kasklar"],
      ["eldivenler", "Eldivenler"],
      ["korumalar", "Korumalar"],
    ]),
  },
  {
    id: "c2",
    slug: "interkom-iletisim",
    name: "İnterkom ve İletişim",
    image: intercom,
    sortOrder: 2,
    children: sub("c2", [
      ["interkomlar", "İnterkomlar"],
      ["kulakliklar", "Kulaklıklar"],
    ]),
  },
  {
    id: "c3",
    slug: "telefon-tutucular",
    name: "Telefon Tutucular",
    image: mount,
    sortOrder: 3,
    children: sub("c3", [
      ["gidon-tutucular", "Gidon Tutucular"],
      ["ayna-tutucular", "Ayna Tutucular"],
    ]),
  },
  {
    id: "c4",
    slug: "carplay-navigasyon",
    name: "CarPlay ve Navigasyon",
    image: nav,
    sortOrder: 4,
    children: sub("c4", [
      ["carplay-ekranlar", "CarPlay Ekranlar"],
      ["navigasyon-cihazlari", "Navigasyon Cihazları"],
    ]),
  },
  {
    id: "c5",
    slug: "kamera-goruntu",
    name: "Kamera ve Görüntü Sistemleri",
    image: camera,
    sortOrder: 5,
    children: sub("c5", [
      ["aksiyon-kameralar", "Aksiyon Kameralar"],
      ["kamera-aparatlari", "Kamera Aparatları"],
    ]),
  },
  {
    id: "c6",
    slug: "aydinlatma",
    name: "Aydınlatma",
    image: light,
    sortOrder: 6,
    children: sub("c6", [
      ["sis-farlari", "Sis Farları"],
      ["led-ampuller", "LED Ampuller"],
    ]),
  },
  {
    id: "c7",
    slug: "motosiklet-aksesuarlari",
    name: "Motosiklet Aksesuarları",
    image: accessory,
    sortOrder: 7,
    children: sub("c7", [
      ["manetler", "Manetler"],
      ["canta-cozumleri", "Çanta Çözümleri"],
    ]),
  },
  {
    id: "c8",
    slug: "yedek-parca",
    name: "Yedek Parça ve Diğer Ürünler",
    image: parts,
    sortOrder: 8,
    children: sub("c8", [
      ["fren-sistemleri", "Fren Sistemleri"],
      ["bakim", "Bakım Ürünleri"],
    ]),
  },
];

export const brands: Brand[] = [
  { id: "b1", slug: "atlas", name: "Atlas", description: "Yer tutucu marka" },
  { id: "b2", slug: "kuzey", name: "Kuzey", description: "Yer tutucu marka" },
  { id: "b3", slug: "rota", name: "Rota", description: "Yer tutucu marka" },
  { id: "b4", slug: "vira", name: "Vira", description: "Yer tutucu marka" },
  { id: "b5", slug: "pist", name: "Pist", description: "Yer tutucu marka" },
  { id: "b6", slug: "delta", name: "Delta", description: "Yer tutucu marka" },
];

type Seed = {
  cat: string;
  sub: string;
  title: string;
  brand: string;
  price: number;
  compareAt?: number;
  stock: StockStatus;
  qty: number;
  attrs: [string, string, string][];
  variants?: { name: string; values: string[]; priceDelta?: number[] };
  featured?: boolean;
  isNew?: boolean;
  pop: number;
};

const S = (
  cat: string,
  subSlug: string,
  title: string,
  brand: string,
  price: number,
  extra: Partial<Seed> & { attrs: Seed["attrs"] },
): Seed => ({
  cat,
  sub: subSlug,
  title,
  brand,
  price,
  stock: "in_stock",
  qty: 24,
  pop: 50,
  ...extra,
});

const seeds: Seed[] = [
  S("c1", "kasklar", "Kapalı Kask Model R1", "b1", 7490, {
    compareAt: 8290,
    attrs: [
      ["kask_tipi", "Kask tipi", "Kapalı"],
      ["malzeme", "Malzeme", "Polikarbonat (örnek)"],
    ],
    variants: { name: "Beden", values: ["S", "M", "L", "XL"] },
    featured: true,
    pop: 92,
  }),
  S("c1", "kasklar", "Çene Açılır Kask Model T2", "b2", 9890, {
    attrs: [
      ["kask_tipi", "Kask tipi", "Çene açılır"],
      ["malzeme", "Malzeme", "Kompozit (örnek)"],
    ],
    variants: { name: "Renk", values: ["Mat Siyah", "Beyaz", "Gri"] },
    isNew: true,
    pop: 75,
  }),
  S("c1", "kasklar", "Açık Kask Model C3", "b4", 4290, {
    attrs: [
      ["kask_tipi", "Kask tipi", "Açık"],
      ["malzeme", "Malzeme", "ABS (örnek)"],
    ],
    stock: "low_stock",
    qty: 3,
    pop: 40,
  }),
  S("c1", "eldivenler", "Deri Sürüş Eldiveni E1", "b5", 1890, {
    compareAt: 2190,
    attrs: [["malzeme", "Malzeme", "Deri"]],
    variants: { name: "Beden", values: ["S", "M", "L", "XL"] },
    pop: 70,
  }),
  S("c1", "eldivenler", "Yazlık File Eldiven E2", "b5", 1290, {
    attrs: [["malzeme", "Malzeme", "Tekstil"]],
    variants: { name: "Beden", values: ["M", "L", "XL"] },
    isNew: true,
    pop: 55,
  }),
  S("c1", "korumalar", "Sırt Koruma Paneli K1", "b2", 2490, {
    attrs: [["malzeme", "Malzeme", "Tekstil"]],
    stock: "out_of_stock",
    qty: 0,
    pop: 30,
  }),
  S("c2", "interkomlar", "Bluetooth İnterkom İ1", "b3", 5490, {
    compareAt: 6190,
    attrs: [
      ["baglanti", "Bağlantı", "Bluetooth"],
      ["kisi", "Grup kapasitesi", "2 kişi (örnek)"],
    ],
    variants: { name: "Paket", values: ["Tekli", "İkili"], priceDelta: [0, 4800] },
    featured: true,
    pop: 95,
  }),
  S("c2", "interkomlar", "Mesh İnterkom İ2 Pro", "b3", 8990, {
    attrs: [
      ["baglanti", "Bağlantı", "Mesh + Bluetooth"],
      ["kisi", "Grup kapasitesi", "Çoklu (örnek)"],
    ],
    isNew: true,
    pop: 80,
  }),
  S("c2", "interkomlar", "Kompakt İnterkom İ3", "b6", 3290, {
    attrs: [
      ["baglanti", "Bağlantı", "Bluetooth"],
      ["kisi", "Grup kapasitesi", "2 kişi (örnek)"],
    ],
    stock: "low_stock",
    qty: 4,
    pop: 60,
  }),
  S("c2", "kulakliklar", "Kask İçi Hoparlör Seti H1", "b6", 1490, {
    attrs: [["baglanti", "Bağlantı", "Kablolu"]],
    pop: 45,
  }),
  S("c3", "gidon-tutucular", "Alüminyum Gidon Telefon Tutucu T1", "b1", 1190, {
    compareAt: 1390,
    attrs: [
      ["montaj", "Montaj", "Gidon"],
      ["kablosuz_sarj", "Kablosuz şarj", "Yok"],
    ],
    variants: { name: "Renk", values: ["Siyah", "Titanyum"] },
    featured: true,
    pop: 98,
  }),
  S("c3", "gidon-tutucular", "Şarjlı Telefon Tutucu T2", "b4", 2290, {
    attrs: [
      ["montaj", "Montaj", "Gidon"],
      ["kablosuz_sarj", "Kablosuz şarj", "Var"],
    ],
    isNew: true,
    pop: 85,
  }),
  S("c3", "ayna-tutucular", "Ayna Bağlantılı Tutucu T3", "b4", 990, {
    attrs: [
      ["montaj", "Montaj", "Ayna"],
      ["kablosuz_sarj", "Kablosuz şarj", "Yok"],
    ],
    pop: 50,
  }),
  S("c3", "gidon-tutucular", "Titreşim Sönümleyici Modül T4", "b1", 590, {
    attrs: [["montaj", "Montaj", "Gidon"]],
    pop: 35,
  }),
  S("c4", "carplay-ekranlar", '5" CarPlay Sürüş Ekranı N1', "b3", 6990, {
    compareAt: 7990,
    attrs: [
      ["ekran", "Ekran boyutu", "5 inç"],
      ["baglanti", "Bağlantı", "Kablosuz"],
    ],
    featured: true,
    pop: 90,
  }),
  S("c4", "carplay-ekranlar", '7" CarPlay Sürüş Ekranı N2', "b3", 8990, {
    attrs: [
      ["ekran", "Ekran boyutu", "7 inç"],
      ["baglanti", "Bağlantı", "Kablosuz"],
    ],
    isNew: true,
    pop: 72,
  }),
  S("c4", "navigasyon-cihazlari", "Motosiklet Navigasyon Cihazı N3", "b6", 11490, {
    attrs: [
      ["ekran", "Ekran boyutu", "5 inç"],
      ["baglanti", "Bağlantı", "Bluetooth"],
    ],
    stock: "preorder",
    qty: 0,
    pop: 40,
  }),
  S("c5", "aksiyon-kameralar", "Aksiyon Kamera A1", "b2", 7890, {
    compareAt: 8490,
    attrs: [["cozunurluk", "Çözünürlük", "4K (örnek)"]],
    featured: true,
    pop: 82,
  }),
  S("c5", "aksiyon-kameralar", "Kompakt Kamera A2", "b2", 4990, {
    attrs: [["cozunurluk", "Çözünürlük", "2.7K (örnek)"]],
    isNew: true,
    pop: 58,
  }),
  S("c5", "kamera-aparatlari", "Kask Çene Kamera Aparatı A3", "b5", 490, {
    attrs: [["montaj", "Montaj", "Kask"]],
    pop: 65,
  }),
  S("c5", "kamera-aparatlari", "Gidon Kamera Bağlantısı A4", "b5", 690, {
    attrs: [["montaj", "Montaj", "Gidon"]],
    stock: "low_stock",
    qty: 2,
    pop: 30,
  }),
  S("c6", "sis-farlari", "LED Sis Farı Seti L1", "b4", 3490, {
    compareAt: 3990,
    attrs: [["guc", "Güç", "2 x 20 W (örnek)"]],
    featured: true,
    pop: 77,
  }),
  S("c6", "sis-farlari", "Kompakt Yardımcı Far L2", "b4", 2190, {
    attrs: [["guc", "Güç", "2 x 10 W (örnek)"]],
    isNew: true,
    pop: 52,
  }),
  S("c6", "led-ampuller", "LED Far Ampulü L3", "b6", 890, {
    attrs: [["soket", "Soket", "H4"]],
    variants: { name: "Soket", values: ["H4", "H7", "H11"] },
    pop: 68,
  }),
  S("c6", "led-ampuller", "LED Sinyal Seti L4", "b6", 640, {
    attrs: [["soket", "Soket", "Evrensel"]],
    pop: 42,
  }),
  S("c7", "manetler", "Ayarlanabilir Manet Seti M1", "b1", 1790, {
    attrs: [["malzeme", "Malzeme", "Alüminyum"]],
    variants: { name: "Renk", values: ["Siyah", "Turuncu", "Gümüş"] },
    isNew: true,
    pop: 63,
  }),
  S("c7", "canta-cozumleri", "Depo Üstü Çanta M2", "b2", 1990, {
    compareAt: 2290,
    attrs: [["hacim", "Hacim", "15 L (örnek)"]],
    pop: 71,
  }),
  S("c7", "canta-cozumleri", "Arka Çanta M3", "b2", 2890, {
    attrs: [["hacim", "Hacim", "30 L (örnek)"]],
    pop: 49,
  }),
  S("c7", "manetler", "Gidon Ağırlığı Seti M4", "b5", 790, {
    attrs: [["malzeme", "Malzeme", "Alüminyum"]],
    stock: "out_of_stock",
    qty: 0,
    pop: 25,
  }),
  S("c8", "fren-sistemleri", "Fren Balata Seti P1", "b6", 690, {
    attrs: [["konum", "Konum", "Ön"]],
    variants: { name: "Konum", values: ["Ön", "Arka"] },
    pop: 66,
  }),
  S("c8", "bakim", "Zincir Bakım Seti P2", "b3", 540, {
    attrs: [["icerik", "İçerik", "Sprey + fırça"]],
    isNew: true,
    pop: 74,
  }),
  S("c8", "bakim", "Buji P3", "b6", 240, { attrs: [["icerik", "İçerik", "Tekli"]], pop: 38 }),
  S("c8", "fren-sistemleri", "Zincir Dişli Seti P4", "b1", 1690, {
    attrs: [["konum", "Konum", "Arka"]],
    stock: "low_stock",
    qty: 5,
    pop: 33,
  }),
];

const catCopy: Record<string, { short: string; long: string }> = {
  c1: {
    short: "Sürüş konforu ve güvenliği için kask ve koruma seçkisinden örnek bir ürün.",
    long: "Kask ve koruma ekipmanı seçerken baş veya vücut ölçünüze uygun beden, ağırlık, havalandırma ve kullanım şekli (şehir içi, uzun yol, macera) gibi kriterleri birlikte değerlendirin. Ölçü tablosu ve bakım önerileri ürün sayfasında yer alacaktır.",
  },
  c2: {
    short: "Sürüş sırasında iletişim için interkom ve kulaklık seçkisinden örnek bir ürün.",
    long: "İnterkom seçerken kask uyumu, bağlantı türü, grup sürüşü ihtiyacı ve şarj/kullanım süresi gibi başlıkları karşılaştırın. Tedarikçi doğrulaması yapılmadan kesin performans değeri paylaşılmaz.",
  },
  c3: {
    short:
      "Telefonunuzu gidon veya aynaya güvenle bağlamak için tutucu seçkisinden örnek bir ürün.",
    long: "Telefon tutucu seçiminde montaj noktası (gidon veya ayna), telefon boyutu ile uyum, titreşim ve şarj ihtiyacı belirleyicidir. Montajdan önce motosikletinizin gidon çapını kontrol etmenizi öneririz.",
  },
  c4: {
    short: "Navigasyon ve bağlantı çözümleri için CarPlay ekran seçkisinden örnek bir ürün.",
    long: "CarPlay ekran ile bağımsız navigasyon cihazı arasında seçim yaparken ekran boyutu, bağlantı şekli, gün ışığında okunabilirlik ve montaj alanı öne çıkar. Ürün bazlı uyumluluk bilgisi gerçek katalogda belirtilecektir.",
  },
  c5: {
    short: "Sürüşlerinizi kaydetmek için kamera ve aparat seçkisinden örnek bir ürün.",
    long: "Aksiyon kamera ve aparat seçerken kayıt kalitesi, depolama, kask/gidon montaj tipi ve titreşim dayanımı gibi kriterlere bakın. Aparatların uyumluluğu kamera modeline göre değişebilir.",
  },
  c6: {
    short: "Görünürlüğü artırmak için aydınlatma seçkisinden örnek bir ürün.",
    long: "Aydınlatma ürünlerinde soket tipi, güç gereksinimi ve montaj yeri motosikletinize uygun olmalıdır. Yol kullanımına dair yasal gereklilikleri kontrol etmeden montaj yapmayın.",
  },
  c7: {
    short: "Günlük kullanım ve yolculuklar için aksesuar seçkisinden örnek bir ürün.",
    long: "Manet, çanta ve benzeri aksesuarlarda malzeme, hacim ve motosikletinizle montaj uyumu önemlidir. Kullanım alışkanlığınıza göre ihtiyaç duyduğunuz hacmi ve montaj şeklini düşünerek seçim yapın.",
  },
  c8: {
    short: "Bakım ve onarım ihtiyaçları için yedek parça seçkisinden örnek bir ürün.",
    long: "Yedek parça alırken motosikletinizin marka, model ve yıl bilgisine uygunluğu mutlaka doğrulayın. Fren gibi güvenlik parçalarının montajını yetkili bir servise yaptırmanızı öneririz.",
  },
};

const catImage: Record<string, string> = {
  c1: helmet,
  c2: intercom,
  c3: mount,
  c4: nav,
  c5: camera,
  c6: light,
  c7: accessory,
  c8: parts,
};
const slugify = (s: string) =>
  s
    .toLocaleLowerCase("tr-TR")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const products: Product[] = seeds.map((s, i) => {
  const id = `p${i + 1}`;
  const sku = `DM-${s.cat.toUpperCase()}-${String(i + 1).padStart(4, "0")}`;
  const variants: ProductVariant[] = s.variants
    ? s.variants.values.map((v, vi) => {
        const delta = s.variants!.priceDelta?.[vi] ?? 0;
        const vStock: StockStatus =
          s.stock === "in_stock" &&
          vi === s.variants!.values.length - 1 &&
          s.variants!.values.length > 2
            ? "out_of_stock"
            : s.stock;
        return {
          id: `${id}-v${vi + 1}`,
          sku: `${sku}-${slugify(v).toUpperCase()}`,
          options: [{ name: s.variants!.name, value: v }],
          price: delta ? s.price + delta : undefined,
          compareAtPrice: delta ? undefined : s.compareAt,
          stockStatus: vStock,
          stockQuantity: vStock === "out_of_stock" ? 0 : Math.max(1, s.qty - vi * 3),
        };
      })
    : [];
  const img = catImage[s.cat]!;
  const created = new Date(Date.UTC(2026, 9, 25) - i * 86400000 * 3).toISOString();
  return {
    id,
    slug: slugify(s.title),
    sku,
    barcode: `869000000${String(1000 + i)}`,
    title: s.title,
    brandId: s.brand,
    categoryId: s.cat,
    subcategoryId: `${s.cat}-${s.sub}`,
    images: [
      { url: img, alt: `${s.title} ürün görseli` },
      { url: img, alt: `${s.title} yakın plan, sol kadraj (örnek)`, focus: "25% 40%", zoom: 1.7 },
      { url: img, alt: `${s.title} yakın plan, sağ kadraj (örnek)`, focus: "75% 65%", zoom: 1.7 },
    ],
    price: s.price,
    compareAtPrice: s.compareAt,
    currency: "TRY",
    stockStatus: s.stock,
    stockQuantity: s.qty,
    shortDescription: catCopy[s.cat]!.short,
    description: `${catCopy[s.cat]!.long}\n\nBu kayıt bir demo üründür; ürüne özgü teknik değerler, uyumluluk ve kutu içeriği gerçek katalog oluşturulduğunda tedarikçi verileriyle eklenecektir.`,
    attributes: s.attrs.map(([key, label, value]) => ({ key, label, value, filterable: true })),
    specifications: [
      { label: "Model kodu", value: sku },
      ...s.attrs.map(([, label, value]) => ({ label, value })),
      { label: "Not", value: "Teknik değerler örnek amaçlıdır." },
    ],
    compatibility:
      s.cat === "c8" || s.cat === "c7"
        ? ["Uyumluluk bilgisi tedarikçi verisiyle eklenecektir."]
        : undefined,
    variants,
    tags: [],
    isFeatured: s.featured,
    isNew: s.isNew,
    popularity: s.pop,
    rating:
      s.pop > 60
        ? { average: Math.round((3.8 + (s.pop % 12) / 10) * 10) / 10, count: Math.round(s.pop / 4) }
        : undefined,
    status: "published",
    createdAt: created,
  };
});

export const reviews: Review[] = [
  {
    id: "r1",
    productId: "*",
    author: "Demo Kullanıcı A.",
    rating: 5,
    title: "Örnek değerlendirme",
    body: "Bu değerlendirme demo amaçlıdır ve gerçek bir müşteri görüşünü yansıtmaz.",
    createdAt: "2026-09-12T10:00:00Z",
    isDemo: true,
  },
  {
    id: "r2",
    productId: "*",
    author: "Demo Kullanıcı B.",
    rating: 4,
    title: "Örnek değerlendirme",
    body: "Gerçek yorumlar, sipariş doğrulaması yapılmış müşterilerden toplanacaktır.",
    createdAt: "2026-08-30T10:00:00Z",
    isDemo: true,
  },
];

export const articles: Article[] = [
  {
    id: "a1",
    slug: "interkom-secim-rehberi",
    title: "Motosiklet interkomu seçerken nelere bakmalı?",
    excerpt: "Bağlantı türleri, grup sürüşü ve kask uyumu hakkında temel noktalar.",
    image: intercom,
    readMinutes: 6,
    category: "Rehber",
  },
  {
    id: "a2",
    slug: "telefon-tutucu-rehberi",
    title: "Doğru telefon tutucuyu bulmak",
    excerpt: "Montaj noktası, titreşim ve şarj seçeneklerini karşılaştırın.",
    image: mount,
    readMinutes: 4,
    category: "Rehber",
  },
  {
    id: "a3",
    slug: "navigasyon-carplay-rehberi",
    title: "CarPlay ekran mı, navigasyon cihazı mı?",
    excerpt: "Kullanım alışkanlığınıza göre iki yaklaşımın artı ve eksileri.",
    image: bannerTech,
    readMinutes: 7,
    category: "Rehber",
  },
  {
    id: "a4",
    slug: "uzun-yol-hazirlik",
    title: "Uzun yola çıkmadan önce aksesuar kontrol listesi",
    excerpt: "Aydınlatma, çanta ve koruma ekipmanları için kısa bir hatırlatma.",
    image: bannerSeason,
    readMinutes: 5,
    category: "Sürüş",
  },
];

const customerNames: [string, string][] = [
  ["Ayşe", "Yılmaz"],
  ["Mehmet", "Kaya"],
  ["Elif", "Demir"],
  ["Can", "Şahin"],
  ["Zeynep", "Çelik"],
  ["Emre", "Arslan"],
  ["Deniz", "Koç"],
  ["Burak", "Aydın"],
];

export const customers: Customer[] = customerNames.map(([f, l], i) => ({
  id: `u${i + 1}`,
  firstName: f,
  lastName: l,
  email: `${slugify(f)}.${slugify(l)}@ornek.com`,
  phone: "+90 5xx xxx xx xx",
  createdAt: new Date(Date.UTC(2026, 3 + i, 4)).toISOString(),
  orderCount: (i % 4) + 1,
  totalSpent: 2500 + i * 3170,
}));

const statuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "delivered",
  "cancelled",
  "shipped",
  "delivered",
  "returned",
  "confirmed",
  "pending",
];
const payStatus = (s: OrderStatus): PaymentStatus =>
  s === "pending"
    ? "awaiting"
    : s === "cancelled"
      ? "failed"
      : s === "returned"
        ? "refunded"
        : "paid";

export const orders: Order[] = statuses.map((status, i) => {
  const c = customers[i % customers.length]!;
  const items = [products[(i * 3) % products.length]!, products[(i * 5 + 2) % products.length]!]
    .slice(0, (i % 2) + 1)
    .map((p, k) => ({
      productId: p.id,
      title: p.title,
      sku: p.sku,
      options: [] as VariantOption[],
      unitPrice: p.price,
      quantity: k + 1,
      image: p.images[0]!.url,
    }));
  const subtotal = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
  const shippingFee = 89.9;
  const created = new Date(Date.UTC(2026, 9, 27, 14) - i * 86400000 * 1.5);
  return {
    id: `o${i + 1}`,
    number: `DEMO-${String(10240 + i)}`,
    customerId: c.id,
    customerName: `${c.firstName} ${c.lastName}`,
    customerEmail: c.email,
    items,
    shippingAddress: {
      firstName: c.firstName,
      lastName: c.lastName,
      phone: c.phone!,
      city: "İstanbul",
      district: "Kadıköy",
      neighborhood: "Örnek Mah.",
      addressLine: "Örnek Sok. No: 1 D: 2",
      postalCode: "34000",
    },
    deliveryMethod: "Standart kargo (örnek)",
    subtotal,
    shippingFee,
    discountTotal: 0,
    total: subtotal + shippingFee,
    status,
    paymentStatus: payStatus(status),
    trackingNumber: status === "shipped" || status === "delivered" ? `TRK${900000 + i}` : undefined,
    history: [
      { status: "pending" as OrderStatus, at: created.toISOString() },
      ...(status !== "pending"
        ? [{ status, at: new Date(created.getTime() + 86400000).toISOString() }]
        : []),
    ],
    createdAt: created.toISOString(),
  };
});

export const campaigns: Campaign[] = [
  {
    id: "cp1",
    name: "Sezon açılışı (örnek)",
    code: "ORNEK10",
    discountType: "percentage",
    discountValue: 10,
    minCartAmount: 1500,
    startsAt: "2026-10-01T00:00:00Z",
    endsAt: "2026-11-30T23:59:00Z",
    eligibleCategoryIds: ["c1", "c2"],
    eligibleProductIds: [],
    isActive: true,
  },
  {
    id: "cp2",
    name: "İlk sipariş (örnek)",
    code: "MERHABA",
    discountType: "fixed",
    discountValue: 150,
    minCartAmount: 1000,
    startsAt: "2026-09-01T00:00:00Z",
    endsAt: "2026-12-31T23:59:00Z",
    eligibleCategoryIds: [],
    eligibleProductIds: [],
    isActive: false,
  },
];

export const stockMovements: StockMovement[] = products.slice(0, 10).map((p, i) => ({
  id: `sm${i + 1}`,
  productId: p.id,
  sku: p.sku,
  delta: i % 3 === 0 ? -2 : 10,
  reason: i % 3 === 0 ? "Sipariş" : "Mal kabul",
  at: new Date(Date.UTC(2026, 9, 26) - i * 43200000).toISOString(),
  by: "Demo personel",
}));

export const heroImage = hero;
