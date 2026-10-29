import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingBag, Trash2, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { TotalsTable } from "@/components/checkout/OrderSummary";
import { Breadcrumbs, DemoNotice, EmptyState, QuantityInput } from "@/components/common/primitives";
import { ProductGrid } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { useRelated } from "@/hooks/queries";
import { couponProblem } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { checkout } from "@/services";
import { errorMessage } from "@/services/api/client";
import { useShop } from "@/state/shop";

export const Route = createFileRoute("/_store/sepet")({
  head: () => ({ meta: [{ title: "Sepetim" }] }),
  component: Page,
});

function CouponBox() {
  const { items, coupon, setCoupon } = useShop();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const problem = couponProblem(coupon, items);

  const apply = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Lütfen bir indirim kodu girin.");
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      const found = await checkout.findCoupon(code);
      if (!found) setError("Bu indirim kodu geçersiz veya süresi dolmuş.");
      else {
        setCoupon(found);
        setCode("");
        toast.success("İndirim kodu uygulandı", { description: found.name });
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (coupon) {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between border bg-surface px-3 py-2 text-sm">
          <span>
            <strong>{coupon.code}</strong>{" "}
            <span className="text-muted-foreground">· {coupon.name}</span>
          </span>
          <button
            type="button"
            aria-label="İndirim kodunu kaldır"
            onClick={() => setCoupon(null)}
            className="cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        {problem === "min" && coupon.minCartAmount && (
          <p role="alert" className="text-xs text-warning">
            Bu kod için en az {formatPrice(coupon.minCartAmount)} tutarında sepet gerekir.
          </p>
        )}
        {problem === "ineligible" && (
          <p role="alert" className="text-xs text-warning">
            Sepetinizdeki ürünler bu kod için uygun değil.
          </p>
        )}
      </div>
    );
  }
  return (
    <form onSubmit={apply} noValidate>
      <label htmlFor="coupon" className="mb-1.5 block text-sm font-bold">
        İndirim kodu
      </label>
      <div className="flex">
        <input
          id="coupon"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          aria-invalid={!!error}
          placeholder="Kodunuzu girin"
          className="h-10 min-w-0 flex-1 border border-input bg-background px-3 text-sm uppercase outline-none focus:border-foreground"
        />
        <Button
          type="submit"
          variant="outline"
          className="rounded-l-none border-l-0"
          disabled={busy}
        >
          {busy ? "Kontrol…" : "Uygula"}
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-1 text-xs font-medium text-destructive">
          {error}
        </p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">
        Demo kodları: ORNEK10 (en az ₺1.500, kask ve interkom ürünlerinde).
      </p>
    </form>
  );
}

function Page() {
  const { items, totals, coupon, ready, setQty, remove, clear } = useShop();
  const related = useRelated(items[0]?.productId);
  const suggestions = related.data?.filter((p) => !items.some((i) => i.productId === p.id));

  return (
    <div className="container-page py-6 md:py-8">
      <Breadcrumbs items={[{ label: "Ana sayfa", to: "/" }, { label: "Sepet" }]} />
      <h1 className="heading-lg mt-3 border-b pb-5">
        Sepetim{" "}
        {ready && items.length > 0 && (
          <span className="text-base font-semibold text-muted-foreground">
            ({totals.itemCount} ürün)
          </span>
        )}
      </h1>

      {!ready ? (
        <div className="mt-8 h-48 animate-pulse bg-surface" />
      ) : items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<ShoppingBag className="size-8" />}
            title="Sepetiniz boş"
            text="Henüz sepetinize ürün eklemediniz. Ürünleri keşfetmeye başlayın."
            action={
              <Button asChild>
                <Link to="/urunler">Alışverişe başla</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem]">
          <section aria-label="Sepet ürünleri">
            <ul className="divide-y border-y">
              {items.map((i) => (
                <li
                  key={i.id}
                  className="grid grid-cols-[5.5rem_1fr] gap-x-4 gap-y-3 py-5 sm:grid-cols-[7rem_1fr_auto]"
                >
                  <Link
                    to="/urun/$slug"
                    params={{ slug: i.slug }}
                    className="row-span-2 aspect-square bg-surface sm:row-span-1"
                  >
                    <img src={i.image} alt={i.title} className="size-full object-cover" />
                  </Link>
                  <div className="min-w-0">
                    <p className="eyebrow">{i.brandName}</p>
                    <Link
                      to="/urun/$slug"
                      params={{ slug: i.slug }}
                      className="text-sm font-bold hover:text-brand"
                    >
                      {i.title}
                    </Link>
                    {i.options.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {i.options.map((o) => `${o.name}: ${o.value}`).join(" · ")}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">Ürün kodu: {i.sku}</p>
                    <p className="mt-2 text-sm tabular-nums">
                      {formatPrice(i.unitPrice)}
                      {i.compareAtPrice && i.compareAtPrice > i.unitPrice && (
                        <span className="ml-2 text-xs text-muted-foreground line-through">
                          {formatPrice(i.compareAtPrice)}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="col-start-2 flex items-center justify-between gap-3 sm:col-start-3 sm:flex-col sm:items-end sm:justify-between">
                    <QuantityInput
                      size="sm"
                      value={i.quantity}
                      max={i.maxQuantity}
                      onChange={(n) => setQty(i.id, n)}
                      label={`${i.title} adedi`}
                    />
                    <p className="text-sm font-extrabold tabular-nums">
                      {formatPrice(i.unitPrice * i.quantity)}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        remove(i.id);
                        toast.success("Ürün sepetten çıkarıldı");
                      }}
                      className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" /> Kaldır
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between text-sm">
              <Link
                to="/urunler"
                className="font-semibold underline underline-offset-4 hover:text-brand"
              >
                Alışverişe devam et
              </Link>
              <button
                type="button"
                onClick={() => {
                  clear();
                  toast.success("Sepet temizlendi");
                }}
                className="cursor-pointer text-muted-foreground hover:text-destructive"
              >
                Sepeti temizle
              </button>
            </div>
          </section>

          <aside
            aria-label="Sipariş özeti"
            className="h-fit space-y-5 border bg-surface p-5 lg:sticky lg:top-40"
          >
            <h2 className="text-base font-extrabold">Sipariş özeti</h2>
            <CouponBox />
            <TotalsTable totals={totals} couponCode={coupon?.code} />
            <Button asChild size="lg" variant="brand" className="w-full">
              <Link to="/odeme">Ödemeye geç</Link>
            </Button>
            <DemoNotice>
              Fiyatlar ve toplamlar bu arayüzde yalnızca gösterim amaçlı hesaplanır; sipariş
              oluşturulmaz.
            </DemoNotice>
          </aside>
        </div>
      )}
      {ready && items.length > 0 && !!suggestions?.length && (
        <section className="mt-16" aria-labelledby="also">
          <h2 id="also" className="heading-lg mb-6">
            Bunları da beğenebilirsiniz
          </h2>
          <ProductGrid products={suggestions} count={4} />
        </section>
      )}
    </div>
  );
}
