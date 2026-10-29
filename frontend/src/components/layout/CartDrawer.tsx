import { Link } from "@tanstack/react-router";
import { ShoppingBag, Trash2 } from "lucide-react";
import { QuantityInput } from "@/components/common/primitives";
import { TotalsTable } from "@/components/checkout/OrderSummary";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatPrice } from "@/lib/format";
import { useShop } from "@/state/shop";

/** Slide-over mini cart. Opens automatically after adding a product. */
export function CartDrawer() {
  const { cartOpen, setCartOpen, items, totals, coupon, setQty, remove } = useShop();
  const close = () => setCartOpen(false);

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b p-5 text-left">
          <SheetTitle>Sepetim ({totals.itemCount})</SheetTitle>
          <SheetDescription className="sr-only">
            Sepetinizdeki ürünler ve toplam tutar
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <ShoppingBag className="size-10 text-muted-foreground" aria-hidden />
            <p className="font-bold">Sepetiniz boş</p>
            <p className="text-sm text-muted-foreground">Beğendiğiniz ürünleri sepete ekleyin.</p>
            <Button asChild onClick={close}>
              <Link to="/urunler">Alışverişe başla</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y overflow-y-auto px-5">
              {items.map((i) => (
                <li key={i.id} className="flex gap-3 py-4">
                  <Link
                    to="/urun/$slug"
                    params={{ slug: i.slug }}
                    onClick={close}
                    className="size-20 shrink-0 bg-surface"
                  >
                    <img src={i.image} alt="" className="size-full object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="eyebrow">{i.brandName}</p>
                    <Link
                      to="/urun/$slug"
                      params={{ slug: i.slug }}
                      onClick={close}
                      className="line-clamp-2 font-bold hover:text-brand"
                    >
                      {i.title}
                    </Link>
                    {i.options.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {i.options.map((o) => o.value).join(" / ")}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <QuantityInput
                        size="sm"
                        value={i.quantity}
                        max={i.maxQuantity}
                        onChange={(n) => setQty(i.id, n)}
                        label={`${i.title} adedi`}
                      />
                      <span className="font-extrabold tabular-nums">
                        {formatPrice(i.unitPrice * i.quantity)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={`${i.title} sepetten çıkar`}
                    onClick={() => remove(i.id)}
                    className="self-start p-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="space-y-4 border-t bg-surface p-5">
              <TotalsTable totals={totals} couponCode={coupon?.code} />
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline" size="lg" onClick={close}>
                  <Link to="/sepet">Sepete git</Link>
                </Button>
                <Button asChild variant="brand" size="lg" onClick={close}>
                  <Link to="/odeme">Ödemeye geç</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
