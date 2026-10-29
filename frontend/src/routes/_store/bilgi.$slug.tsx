import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Breadcrumbs, DemoNotice } from "@/components/common/primitives";
import { Button } from "@/components/ui/button";
import { infoPages, siteConfig } from "@/config/site";

export const Route = createFileRoute("/_store/bilgi/$slug")({
  loader: ({ params }) => {
    const page = infoPages[params.slug];
    if (!page) throw notFound();
    return { page };
  },
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.page.title ?? "Bilgi" }] }),
  component: Page,
});

// Section outlines per page. Text is intentionally a placeholder: real business and legal
// content must be supplied (and legally reviewed) before publishing.
const outlines: Record<string, string[]> = {
  hakkimizda: ["Marka hikâyesi", "Misyonumuz", "Neden biz?"],
  "kargo-ve-teslimat": [
    "Kargo firmaları",
    "Teslimat süreleri",
    "Kargo ücretleri",
    "Teslimat takibi",
  ],
  "iade-ve-degisim": ["İade koşulları", "Değişim süreci", "İade edilemeyen ürünler", "Geri ödeme"],
  "gizlilik-politikasi": [
    "Toplanan veriler",
    "Verilerin kullanım amaçları",
    "Çerezler",
    "Haklarınız",
  ],
  kvkk: [
    "Veri sorumlusu",
    "İşlenen kişisel veriler",
    "İşleme amaçları ve hukuki sebepler",
    "Başvuru hakları",
  ],
  "mesafeli-satis-sozlesmesi": [
    "Taraflar",
    "Sözleşme konusu ürünler",
    "Cayma hakkı",
    "Uyuşmazlık çözümü",
  ],
  "on-bilgilendirme-formu": [
    "Satıcı bilgileri",
    "Ürün ve fiyat bilgileri",
    "Ödeme ve teslimat",
    "Cayma hakkı",
  ],
};

function Page() {
  const { slug } = Route.useParams();
  const { page } = Route.useLoaderData();
  return (
    <div className="container-page py-6 md:py-8">
      <Breadcrumbs items={[{ label: "Ana sayfa", to: "/" }, { label: page.title }]} />
      <article className="mx-auto mt-6 max-w-3xl">
        <h1 className="heading-lg">{page.title}</h1>
        <p className="mt-4 text-base text-muted-foreground">{page.intro}</p>
        <DemoNotice className="mt-6">
          Bu sayfanın içeriği henüz hazırlanmadı. Gerçek işletme bilgileri ve gerekli hukuki
          metinler belirlendiğinde burada yayımlanacaktır; aşağıdaki başlıklar yalnızca taslaktır.
        </DemoNotice>
        <div className="mt-8 divide-y border-y">
          {(outlines[slug] ?? []).map((h) => (
            <section key={h} className="py-5">
              <h2 className="text-base font-extrabold">{h}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">İçerik eklenecek.</p>
            </section>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Sorularınız için{" "}
          <Link to="/iletisim" className="font-semibold text-foreground underline">
            iletişim
          </Link>{" "}
          sayfamızı kullanabilirsiniz.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/">Ana sayfaya dön</Link>
        </Button>
        <p className="sr-only">{siteConfig.name}</p>
      </article>
    </div>
  );
}
