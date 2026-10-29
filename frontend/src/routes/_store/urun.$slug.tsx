import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Heart, ShoppingBag, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Badge,
  Breadcrumbs,
  DemoNotice,
  EmptyState,
  ErrorState,
  Price,
  QuantityInput,
} from "@/components/common/primitives";
import { ProductGrid } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { siteConfig } from "@/config/site";
import { catalog } from "@/services";
import { useRecentlyViewed } from "@/hooks/recently-viewed";
import {
  useBrands,
  useCategories,
  useProduct,
  useProductsByIds,
  useRelated,
  useReviews,
} from "@/hooks/queries";
import {
  brandNameOf,
  cropStyle,
  effectivePrice,
  findCategory,
  maxQuantity,
  purchasable,
  toCartItem,
  variantLabel,
} from "@/lib/catalog-utils";
import { formatDate, formatPrice } from "@/lib/format";
import { stockLabels } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { useShop } from "@/state/shop";
import type { Product } from "@/types";

export const Route = createFileRoute("/_store/urun/$slug")({
  loader: ({ params }) => catalog.getProduct(params.slug),
  head: ({ loaderData: p }) => {
    if (!p) return { meta: [{ title: "Ürün bulunamadı" }] };
    const stock =
      p.stockStatus === "out_of_stock"
        ? "OutOfStock"
        : p.stockStatus === "preorder"
          ? "PreOrder"
          : "InStock";
    const image = p.images[0]?.url;
    return {
      meta: [
        { title: `${p.title} | ${siteConfig.name}` },
        { name: "description", content: p.shortDescription },
        { property: "og:title", content: p.title },
        { property: "og:description", content: p.shortDescription },
        { property: "og:type", content: "product" },
        ...(image ? [{ property: "og:image", content: image }] : []),
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: p.title,
            sku: p.sku,
            description: p.shortDescription,
            ...(image ? { image } : {}),
            offers: {
              "@type": "Offer",
              priceCurrency: "TRY",
              price: p.price,
              availability: `https://schema.org/${stock}`,
            },
          }),
        },
      ],
    };
  },
  component: Page,
});

function Gallery({ product }: { product: Product }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  // Demo products reuse one picture; only show thumbnails for distinct images.
  const images = product.images.filter(
    (im, idx, all) => all.findIndex((x) => x.url === im.url && x.focus === im.focus) === idx,
  );
  const img = images[i] ?? images[0];
  return (
    <div className={cn("grid gap-3", images.length > 1 && "md:grid-cols-[5rem_1fr]")}>
      {images.length > 1 && (
        <div
          role="tablist"
          aria-label="Ürün görselleri"
          className="order-2 flex gap-2 md:order-1 md:flex-col"
        >
          {images.map((im, idx) => (
            <button
              key={`${im.url}-${im.focus ?? ""}`}
              type="button"
              role="tab"
              aria-selected={idx === i}
              aria-label={`Görsel ${idx + 1}`}
              onClick={() => setI(idx)}
              className={cn(
                "aspect-square w-16 cursor-pointer overflow-hidden border-2 bg-surface md:w-full",
                idx === i ? "border-foreground" : "border-transparent hover:border-input",
              )}
            >
              <img src={im.url} alt="" style={cropStyle(im)} className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div
        className="relative order-1 aspect-[4/3] cursor-zoom-in overflow-hidden bg-surface md:order-2"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({
            x: ((e.clientX - r.left) / r.width) * 100,
            y: ((e.clientY - r.top) / r.height) * 100,
          });
        }}
        onMouseLeave={() => setZoom(null)}
      >
        {img && (
          <img
            src={img.url}
            alt={img.alt}
            style={{
              ...cropStyle(img, zoom ? 1.8 : 1),
              ...(zoom ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : {}),
            }}
            className="size-full object-cover transition-transform duration-200"
          />
        )}
        <span className="pointer-events-none absolute bottom-2 right-2 bg-background/90 px-2 py-1 text-[11px] font-semibold text-muted-foreground max-md:hidden">
          Yakınlaştırmak için üzerine gelin
        </span>
      </div>
    </div>
  );
}

function Purchase({ product }: { product: Product }) {
  const { data: brands } = useBrands();
  const { add, isFavorite, toggleFavorite } = useShop();
  const firstOk = product.variants.find((v) => purchasable(product, v));
  const [variantId, setVariantId] = useState<string | undefined>(firstOk?.id);
  const [qty, setQty] = useState(1);
  const variant = product.variants.find((v) => v.id === variantId);
  const hasVariants = product.variants.length > 0;
  const { price, compareAt } = effectivePrice(product, variant);
  const status = variant?.stockStatus ?? product.stockStatus;
  const stock = stockLabels[status];
  const max = maxQuantity(product, variant);
  const canBuy = purchasable(product, variant) && (!hasVariants || !!variant);
  const fav = isFavorite(product.id);
  const optionName = product.variants[0]?.options[0]?.name;
  const addToCart = () =>
    add(toCartItem(product, brandNameOf(brands, product.brandId), variant, qty));

  useEffect(() => setQty((q) => Math.min(q, Math.max(1, max))), [max]);

  return (
    <div className="space-y-5">
      <Price price={price} compareAt={compareAt} size="lg" />
      <p className="flex items-center gap-2 text-sm">
        <span
          className={cn(
            "size-2 rounded-full",
            status === "in_stock"
              ? "bg-success"
              : status === "out_of_stock"
                ? "bg-destructive"
                : "bg-warning",
          )}
          aria-hidden
        />
        <span className="font-semibold">{stock.label}</span>
        {status === "low_stock" && (
          <span className="text-muted-foreground">
            (stokta {variant?.stockQuantity ?? product.stockQuantity} adet)
          </span>
        )}
      </p>
      <p className="text-sm text-muted-foreground">{product.shortDescription}</p>

      {hasVariants && (
        <fieldset>
          <legend className="mb-2 text-sm font-bold">
            {optionName}:{" "}
            <span className="font-normal text-muted-foreground">
              {variant ? variantLabel(variant) : "Seçiniz"}
            </span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const out = !purchasable(product, v);
              const selected = v.id === variantId;
              return (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setVariantId(v.id)}
                  className={cn(
                    "min-h-10 min-w-12 cursor-pointer border px-4 text-sm font-semibold transition-colors",
                    selected
                      ? "border-foreground bg-primary text-primary-foreground"
                      : "border-input hover:border-foreground",
                    out && !selected && "text-muted-foreground line-through",
                  )}
                >
                  {variantLabel(v)}
                  {out && <span className="sr-only"> (tükendi)</span>}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <QuantityInput value={qty} onChange={setQty} max={Math.max(1, max)} />
        <Button
          size="lg"
          variant="brand"
          className="h-11 min-w-0 flex-1 sm:min-w-48"
          disabled={!canBuy}
          onClick={() => {
            addToCart();
          }}
        >
          <ShoppingBag />{" "}
          {canBuy
            ? status === "preorder"
              ? "Ön sipariş ver (demo)"
              : "Sepete ekle"
            : "Stokta yok"}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-11"
          aria-pressed={fav}
          aria-label={fav ? "Favorilerden çıkar" : "Favorilere ekle"}
          onClick={() => {
            toggleFavorite(product.id);
            toast.success(fav ? "Favorilerden çıkarıldı" : "Favorilere eklendi");
          }}
        >
          <Heart className={cn(fav && "fill-brand text-brand")} />
        </Button>
      </div>
      {hasVariants && !variant && (
        <p role="alert" className="text-xs font-medium text-destructive">
          Sepete eklemek için {optionName?.toLocaleLowerCase("tr-TR")} seçin.
        </p>
      )}

      <ul className="grid gap-2 border-t pt-4 text-xs text-muted-foreground">
        {siteConfig.trust.slice(0, 3).map((t) => (
          <li key={t.title} className="flex items-start gap-2">
            <Check className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden />
            <span>
              <strong className="text-foreground">{t.title}:</strong> {t.text}
            </span>
          </li>
        ))}
      </ul>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-t pt-4 text-xs">
        <dt className="text-muted-foreground">Ürün kodu (SKU)</dt>
        <dd className="font-semibold">{variant?.sku ?? product.sku}</dd>
        {product.barcode && (
          <>
            <dt className="text-muted-foreground">Barkod</dt>
            <dd className="font-semibold">{product.barcode}</dd>
          </>
        )}
      </dl>

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t bg-background/95 p-3 backdrop-blur md:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground">{product.title}</p>
          <p className="text-base font-extrabold tabular-nums text-brand">{formatPrice(price)}</p>
        </div>
        <Button variant="brand" size="lg" disabled={!canBuy} onClick={addToCart}>
          <ShoppingBag /> {canBuy ? "Sepete ekle" : "Stokta yok"}
        </Button>
      </div>
    </div>
  );
}

function Skeletons() {
  return (
    <div className="container-page grid gap-10 py-10 lg:grid-cols-2">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    </div>
  );
}

function Page() {
  const { slug } = Route.useParams();
  const { data: product, isLoading, isError, refetch } = useProduct(slug);
  const { data: brands } = useBrands();
  const { data: categories } = useCategories();
  const related = useRelated(product?.id);
  const reviews = useReviews(product?.id);
  const recent = useRecentlyViewed();
  const recentIds = recent.ids.filter((x) => x !== product?.id).slice(0, 4);
  const recentProducts = useProductsByIds(recentIds);
  const recordView = recent.record;
  useEffect(() => {
    if (product?.id) recordView(product.id);
  }, [product?.id, recordView]);

  if (isLoading) return <Skeletons />;
  if (isError)
    return (
      <div className="container-page py-16">
        <ErrorState onRetry={() => void refetch()} />
      </div>
    );
  if (!product) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Ürün bulunamadı"
          text="Bu ürün kaldırılmış veya adresi değişmiş olabilir."
          action={
            <Button asChild>
              <Link to="/urunler">Ürünlere göz at</Link>
            </Button>
          }
        />
      </div>
    );
  }
  const category = findCategory(categories, product.categoryId);
  const sub = findCategory(categories, product.subcategoryId);

  return (
    <div className="container-page py-6 pb-28 md:py-8 md:pb-8">
      <Breadcrumbs
        items={[
          { label: "Ana sayfa", to: "/" },
          ...(category ? [{ label: category.name, to: `/kategori/${category.slug}` }] : []),
          ...(sub && category
            ? [{ label: sub.name, to: `/kategori/${category.slug}`, search: { alt: sub.slug } }]
            : []),
          { label: product.title },
        ]}
      />
      <div className="mt-5 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <Gallery product={product} />
        <div>
          <p className="eyebrow">{brandNameOf(brands, product.brandId)}</p>
          <h1 className="heading-lg mt-1.5">{product.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            {product.isNew && <Badge tone="info">Yeni</Badge>}
            {product.rating && (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Star className="size-4 fill-brand text-brand" aria-hidden />
                <span className="font-semibold text-foreground">
                  {product.rating.average.toFixed(1).replace(".", ",")}
                </span>{" "}
                ({product.rating.count} · demo)
              </span>
            )}
          </div>
          <div className="mt-5">
            <Purchase key={product.id} product={product} />
          </div>
          <DemoNotice className="mt-5">
            Bu ürün bir demo kayıttır. Görseller, özellikler ve fiyatlar gerçek ürünü temsil etmez.
          </DemoNotice>
        </div>
      </div>

      <Tabs defaultValue="desc" className="mt-12">
        <TabsList className="h-auto w-full justify-start gap-6 overflow-x-auto rounded-none border-b bg-transparent p-0">
          {[
            ["desc", "Açıklama"],
            ["specs", "Teknik özellikler"],
            ["shipping", "Kargo ve iade"],
            ["reviews", "Değerlendirmeler"],
          ].map(([v = "", l]) => (
            <TabsTrigger
              key={v}
              value={v}
              className="-mb-px cursor-pointer rounded-none border-b-2 border-transparent bg-transparent px-0 py-3 text-sm font-bold data-[state=active]:border-brand data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              {l}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="desc" className="max-w-3xl pt-6 text-sm leading-relaxed">
          <p>{product.description}</p>
          {product.compatibility && (
            <div className="mt-4">
              <h3 className="font-bold">Uyumluluk</h3>
              <ul className="mt-1 list-disc pl-5 text-muted-foreground">
                {product.compatibility.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>
        <TabsContent value="specs" className="max-w-3xl pt-6">
          <dl className="divide-y border-y text-sm">
            {product.specifications.map((s) => (
              <div
                key={s.label}
                className="grid grid-cols-[10rem_1fr] gap-4 py-2.5 sm:grid-cols-[14rem_1fr]"
              >
                <dt className="text-muted-foreground">{s.label}</dt>
                <dd className="font-medium">{s.value}</dd>
              </div>
            ))}
          </dl>
        </TabsContent>
        <TabsContent value="shipping" className="max-w-3xl space-y-3 pt-6 text-sm leading-relaxed">
          <p className="flex gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-success" />
            Tahmini kargo ücreti {formatPrice(siteConfig.shipping.flatEstimate)} (örnek). Kesin
            tutar ve süre ödeme adımında netleşecektir.
          </p>
          <p className="flex gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-success" />
            İade ve değişim koşulları ilgili sayfada yayımlanacaktır.
          </p>
          <p className="text-muted-foreground">
            Ayrıntılar için{" "}
            <Link to="/bilgi/$slug" params={{ slug: "kargo-ve-teslimat" }} className="underline">
              Kargo ve Teslimat
            </Link>{" "}
            ve{" "}
            <Link to="/bilgi/$slug" params={{ slug: "iade-ve-degisim" }} className="underline">
              İade ve Değişim
            </Link>{" "}
            sayfalarına bakın.
          </p>
        </TabsContent>
        <TabsContent value="reviews" className="max-w-3xl pt-6">
          <DemoNotice className="mb-4">
            Aşağıdaki değerlendirmeler örnektir; gerçek müşteri görüşü değildir.
          </DemoNotice>
          <ul className="divide-y border-y">
            {reviews.data?.map((r) => (
              <li key={r.id} className="py-4 text-sm">
                <div className="flex items-center gap-2">
                  <span aria-label={`${r.rating} yıldız`} className="flex">
                    {Array.from({ length: 5 }, (_, k) => (
                      <Star
                        key={k}
                        className={cn(
                          "size-3.5",
                          k < r.rating ? "fill-brand text-brand" : "text-input",
                        )}
                      />
                    ))}
                  </span>
                  <span className="font-bold">{r.title}</span>
                  <Badge>Demo</Badge>
                </div>
                <p className="mt-1 text-muted-foreground">{r.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {r.author} · {formatDate(r.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>

      <section className="mt-16" aria-labelledby="related">
        <h2 id="related" className="heading-lg mb-6">
          Benzer ürünler
        </h2>
        <ProductGrid products={related.data} loading={related.isLoading} count={4} />
      </section>
      {recentIds.length > 0 && (
        <section className="mt-16" aria-labelledby="recent">
          <h2 id="recent" className="heading-lg mb-6">
            Son baktığınız ürünler
          </h2>
          <ProductGrid
            products={recentProducts.data}
            loading={recentProducts.isLoading}
            count={recentIds.length}
          />
        </section>
      )}
    </div>
  );
}
