import { formatPrice } from "@/lib/format";
import type { CartItem, CartTotals } from "@/types";

export function TotalsTable({
  totals,
  shippingOverride,
  couponCode,
}: {
  totals: CartTotals;
  shippingOverride?: number | null;
  couponCode?: string | undefined;
}) {
  const shipping = shippingOverride === undefined ? totals.shippingEstimate : shippingOverride;
  const total = totals.total - (totals.shippingEstimate ?? 0) + (shipping ?? 0);
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Ara toplam</dt>
        <dd className="tabular-nums">{formatPrice(totals.subtotal)}</dd>
      </div>
      {totals.couponDiscount > 0 && (
        <div className="flex justify-between text-success">
          <dt>İndirim kodu{couponCode ? ` (${couponCode})` : ""}</dt>
          <dd className="tabular-nums">−{formatPrice(totals.couponDiscount)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Kargo (tahmini)</dt>
        <dd className="tabular-nums">
          {shipping === 0
            ? "Ücretsiz"
            : shipping == null
              ? "Sonra hesaplanacak"
              : formatPrice(shipping)}
        </dd>
      </div>
      <div className="flex justify-between border-t pt-3 text-base font-extrabold">
        <dt>Toplam</dt>
        <dd className="tabular-nums">{formatPrice(total)}</dd>
      </div>
      {totals.discountTotal > 0 && (
        <p className="text-xs text-muted-foreground">
          Ürün indirimlerinden toplam {formatPrice(totals.discountTotal)} tasarruf ediyorsunuz.
        </p>
      )}
    </dl>
  );
}

export function SummaryItems({ items }: { items: CartItem[] }) {
  return (
    <ul className="divide-y">
      {items.map((i) => (
        <li key={i.id} className="flex gap-3 py-3">
          <div className="relative size-16 shrink-0 bg-surface">
            <img src={i.image} alt="" className="size-full object-cover" />
            <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {i.quantity}
            </span>
          </div>
          <div className="min-w-0 flex-1 text-sm">
            <p className="line-clamp-2 font-semibold">{i.title}</p>
            {i.options.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {i.options.map((o) => o.value).join(" / ")}
              </p>
            )}
          </div>
          <p className="text-sm font-semibold tabular-nums">
            {formatPrice(i.unitPrice * i.quantity)}
          </p>
        </li>
      ))}
    </ul>
  );
}
