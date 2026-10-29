import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Price } from "@/components/common/primitives";
import { Skeleton } from "@/components/ui/skeleton";
import { brandNameOf, cropStyle, purchasable, toCartItem } from "@/lib/catalog-utils";
import { discountPercent } from "@/lib/format";
import { stockLabels } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { useBrands } from "@/hooks/queries";
import { useShop } from "@/state/shop";
import type { Product } from "@/types";

export function FavoriteButton({ product, className }: { product: Product; className?: string }) {
  const { isFavorite, toggleFavorite } = useShop();
  const active = isFavorite(product.id);
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={
        active ? `${product.title} favorilerden çıkar` : `${product.title} favorilere ekle`
      }
      onClick={() => {
        toggleFavorite(product.id);
        toast.success(active ? "Favorilerden çıkarıldı" : "Favorilere eklendi");
      }}
      className={cn(
        "flex size-9 cursor-pointer items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:text-brand",
        className,
      )}
    >
      <Heart className={cn("size-4", active && "fill-brand text-brand")} />
    </button>
  );
}

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const { data: brands } = useBrands();
  const { add } = useShop();
  const pct = discountPercent(product.price, product.compareAtPrice);
  const hasVariants = product.variants.length > 0;
  const canQuickAdd = !hasVariants && purchasable(product);
  const stock = stockLabels[product.stockStatus];
  const brandName = brandNameOf(brands, product.brandId);

  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        <Link to="/urun/$slug" params={{ slug: product.slug }} tabIndex={-1} aria-hidden>
          <img
            src={product.images[0]?.url}
            alt=""
            loading={priority ? "eager" : "lazy"}
            className={cn(
              "size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]",
              product.stockStatus === "out_of_stock" && "opacity-60 grayscale",
            )}
          />
          {product.images[1] && (
            <img
              src={product.images[1].url}
              alt=""
              loading="lazy"
              style={cropStyle(product.images[1])}
              className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 max-md:hidden"
            />
          )}
        </Link>
        <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1">
          {pct && (
            <span className="bg-brand px-2 py-0.5 text-xs font-bold text-brand-foreground">
              %{pct}
            </span>
          )}
          {product.isNew && (
            <span className="bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
              Yeni
            </span>
          )}
          {product.popularity >= 90 && (
            <span className="bg-background px-2 py-0.5 text-xs font-bold text-foreground">
              Çok satan
            </span>
          )}
        </div>
        <FavoriteButton product={product} className="absolute right-2 top-2 z-10" />
        {canQuickAdd && (
          <button
            type="button"
            onClick={() => {
              add(toCartItem(product, brandName, undefined, 1));
            }}
            className="absolute inset-x-0 bottom-0 z-10 flex translate-y-full cursor-pointer items-center justify-center gap-2 bg-primary py-2.5 text-xs font-bold text-primary-foreground transition-transform focus-visible:translate-y-0 group-hover:translate-y-0 max-md:hidden"
          >
            <ShoppingBag className="size-4" /> Sepete ekle
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 pt-3">
        <span className="eyebrow">{brandName || " "}</span>
        <h3 className="text-sm font-semibold leading-snug">
          <Link
            to="/urun/$slug"
            params={{ slug: product.slug }}
            className="hover:text-brand after:absolute after:inset-x-0 after:top-0 after:bottom-0 after:content-[''] after:z-0"
          >
            {product.title}
          </Link>
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <Price price={product.price} compareAt={product.compareAtPrice} size="sm" />
          {product.stockStatus !== "in_stock" && (
            <span
              className={cn(
                "text-xs font-semibold",
                product.stockStatus === "out_of_stock"
                  ? "text-destructive"
                  : "text-muted-foreground",
              )}
            >
              {product.stockStatus === "low_stock"
                ? `Son ${product.stockQuantity} ürün`
                : stock.label}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[4/3] w-full" />
      <Skeleton className="mt-3 h-3 w-16" />
      <Skeleton className="mt-2 h-4 w-4/5" />
      <Skeleton className="mt-2 h-4 w-20" />
    </div>
  );
}

export function ProductGrid({
  products,
  loading,
  count = 8,
  className,
}: {
  products?: Product[] | undefined;
  loading?: boolean;
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4", className)}
    >
      {loading || !products
        ? Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)
        : products.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 4} />)}
    </div>
  );
}
