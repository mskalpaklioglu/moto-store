import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Copy } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Countdown, Reveal } from "@/components/common/motion";
import { ErrorState } from "@/components/common/primitives";
import { TrustBar } from "@/components/layout/Footer";
import { HeroSlider } from "@/components/layout/HeroSlider";
import { ProductGrid } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { siteConfig } from "@/config/site";
import { useRecentlyViewed } from "@/hooks/recently-viewed";
import { useBrands, useCategories, useProducts, useProductsByIds } from "@/hooks/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_store/")({
  component: Home,
});

function Section({
  title,
  eyebrow,
  action,
  children,
  className,
}: {
  className?: string;
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={cn("container-page mt-16 md:mt-24", className)}>
      <Reveal>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
            <h2 className="heading-lg">{title}</h2>
          </div>
          {action}
        </div>
        {children}
      </Reveal>
    </section>
  );
}

const SeeAll = ({
  search,
  label = "Tümünü gör",
}: {
  search?: Record<string, unknown>;
  label?: string;
}) => (
  <Link
    to="/urunler"
    search={search as never}
    className="inline-flex shrink-0 items-center gap-1 text-sm font-bold hover:text-brand"
  >
    {label} <ArrowRight className="size-4" />
  </Link>
);

const tabs = [
  { id: "popular", label: "Çok satanlar", query: { sort: "popular", pageSize: 8 } },
  { id: "new", label: "Yeni gelenler", query: { sort: "newest", pageSize: 8 } },
  { id: "sale", label: "İndirimdekiler", query: { onSale: true, sort: "popular", pageSize: 8 } },
] as const;

const tabSearch: Record<string, Record<string, unknown>> = {
  popular: { sirala: "popular" },
  new: { sirala: "newest" },
  sale: { indirim: true },
};

function Showcase() {
  const [tab, setTab] = useState<string>("popular");
  const popular = useProducts(tabs[0].query);
  const fresh = useProducts(tabs[1].query);
  const sale = useProducts(tabs[2].query);
  const byTab = { popular, new: fresh, sale } as const;

  return (
    <Section
      title="Sizin için seçtiklerimiz"
      eyebrow="Vitrin"
      action={<SeeAll search={tabSearch[tab] ?? {}} />}
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6 h-auto w-full justify-start gap-6 overflow-x-auto rounded-none border-b bg-transparent p-0">
          {tabs.map((t) => (
            <TabsTrigger
              key={t.id}
              value={t.id}
              className="-mb-px cursor-pointer rounded-none border-b-2 border-transparent bg-transparent px-0 py-3 text-sm font-bold data-[state=active]:border-brand data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((t) => {
          const q = byTab[t.id];
          return (
            <TabsContent key={t.id} value={t.id} className="animate-in fade-in duration-500">
              {q.isError ? (
                <ErrorState onRetry={() => void q.refetch()} />
              ) : (
                <ProductGrid products={q.data?.items} loading={q.isLoading} />
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </Section>
  );
}

function PromoBand() {
  const promo = siteConfig.promo;
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(promo.code);
      setCopied(true);
      toast.success("Kod kopyalandı", { description: promo.code });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Kod kopyalanamadı");
    }
  };
  return (
    <section
      aria-label="Kampanya"
      className="relative isolate mt-16 overflow-hidden bg-primary md:mt-24"
    >
      <img
        src={promo.image}
        alt=""
        loading="lazy"
        className="absolute inset-0 -z-10 size-full object-cover opacity-50"
      />
      <div className="image-scrim absolute inset-0 -z-10" aria-hidden />
      <div className="container-page grid gap-8 py-14 md:py-20 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        <Reveal>
          <p className="eyebrow !text-on-image/80">{promo.eyebrow}</p>
          <h2 className="heading-xl mt-3 max-w-xl text-on-image">{promo.title}</h2>
          <p className="mt-4 max-w-lg text-on-image/85">{promo.text}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void copy()}
              className="inline-flex h-12 cursor-pointer items-center gap-2 border border-dashed border-on-image/70 px-5 text-sm font-extrabold tracking-[0.2em] text-on-image hover:bg-on-image/10"
              aria-label={`${promo.code} kodunu kopyala`}
            >
              {promo.code} {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </button>
            <Button asChild variant="brand" size="lg">
              <Link to="/kategori/$slug" params={{ slug: promo.cta.category }}>
                {promo.cta.label} <ArrowRight />
              </Link>
            </Button>
          </div>
        </Reveal>
        <Reveal delay={150} className="lg:justify-self-end">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-on-image/70">
            Kampanya bitimine kalan süre
          </p>
          <Countdown to={promo.endsAt} />
        </Reveal>
      </div>
    </section>
  );
}

function RecentlyViewed() {
  const { ids } = useRecentlyViewed();
  const { data } = useProductsByIds(ids.slice(0, 4));
  if (!ids.length) return null;
  return (
    <Section title="Son baktığınız ürünler" eyebrow="Kaldığınız yerden devam edin">
      <ProductGrid products={data} loading={!data} count={Math.min(ids.length, 4)} />
    </Section>
  );
}

function Home() {
  const { data: categories, isError: catError } = useCategories();
  const { data: brands } = useBrands();

  return (
    <>
      <HeroSlider />
      <TrustBar />

      <Section
        title="Kategorilere göz atın"
        eyebrow="Öne çıkan kategoriler"
        action={
          <Link
            to="/kategoriler"
            className="inline-flex items-center gap-1 text-sm font-bold hover:text-brand"
          >
            Tüm kategoriler <ArrowRight className="size-4" />
          </Link>
        }
      >
        {catError ? (
          <ErrorState />
        ) : (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {(categories ?? Array.from({ length: 8 }, () => null)).map((c, i) => (
              <li key={c?.id ?? i}>
                {c ? (
                  <Link
                    to="/kategori/$slug"
                    params={{ slug: c.slug }}
                    className="group relative block aspect-[4/3] overflow-hidden bg-surface"
                  >
                    <img
                      src={c.image}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <span className="image-scrim-bottom absolute inset-0" aria-hidden />
                    <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 text-sm font-bold leading-tight text-on-image md:p-4">
                      {c.name}
                      <ArrowRight className="size-4 shrink-0 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </span>
                  </Link>
                ) : (
                  <div className="aspect-[4/3] animate-pulse bg-surface" />
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Showcase />

      <PromoBand />

      <section
        aria-label="Koleksiyonlar"
        className="container-page mt-16 grid gap-4 md:mt-24 md:grid-cols-2"
      >
        {siteConfig.banners.map((b, i) => (
          <Reveal key={b.id} delay={i * 120}>
            <Link
              to="/kategori/$slug"
              params={{ slug: b.cta.category }}
              className="group relative isolate flex min-h-72 items-end overflow-hidden bg-primary p-6 md:min-h-96 md:p-8"
            >
              <img
                src={b.image}
                alt={b.imageAlt}
                loading="lazy"
                className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="image-scrim-bottom absolute inset-0 -z-10" aria-hidden />
              <span className="max-w-sm text-on-image">
                <span className="eyebrow !text-on-image/75">{b.eyebrow}</span>
                <span className="mt-2 block text-2xl font-extrabold leading-tight">{b.title}</span>
                <span className="mt-2 block text-sm text-on-image/85">{b.text}</span>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold underline underline-offset-4">
                  {b.cta.label} <ArrowRight className="size-4" />
                </span>
              </span>
            </Link>
          </Reveal>
        ))}
      </section>

      <RecentlyViewed />

      <Section title="Markalar" eyebrow="Marka seçkisi (yer tutucu)">
        <ul className="grid grid-cols-2 gap-px border bg-border sm:grid-cols-3 lg:grid-cols-6">
          {(brands ?? []).map((b) => (
            <li key={b.id} className="bg-background">
              <Link
                to="/urunler"
                search={{ marka: [b.slug] }}
                className="flex h-20 items-center justify-center text-sm font-extrabold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
              >
                {b.name}
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
