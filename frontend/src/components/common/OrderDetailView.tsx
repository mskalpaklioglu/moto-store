// Order detail body shared by the account area and the admin panel.
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/common/StatusBadge";
import { formatDateTime, formatPrice } from "@/lib/format";
import { orderStatusLabels } from "@/lib/labels";
import type { Order } from "@/types";

export function OrderItemsTable({ order }: { order: Order }) {
  return (
    <div className="overflow-x-auto border">
      <table className="w-full text-sm">
        <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="p-3 font-bold">Ürün</th>
            <th className="p-3 text-right font-bold">Adet</th>
            <th className="p-3 text-right font-bold">Birim fiyat</th>
            <th className="p-3 text-right font-bold">Tutar</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {order.items.map((i, idx) => (
            <tr key={`${i.productId}-${idx}`}>
              <td className="min-w-52 p-3">
                <div className="flex items-center gap-3">
                  {i.image && (
                    <img
                      src={i.image}
                      alt=""
                      className="size-12 shrink-0 bg-surface object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold">{i.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {i.sku}
                      {i.options.length > 0 && ` · ${i.options.map((o) => o.value).join(" / ")}`}
                    </p>
                  </div>
                </div>
              </td>
              <td className="p-3 text-right tabular-nums">{i.quantity}</td>
              <td className="p-3 text-right tabular-nums">{formatPrice(i.unitPrice)}</td>
              <td className="p-3 text-right font-semibold tabular-nums">
                {formatPrice(i.unitPrice * i.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function OrderTotals({ order }: { order: Order }) {
  return (
    <dl className="ml-auto w-full max-w-xs space-y-1.5 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Ara toplam</dt>
        <dd className="tabular-nums">{formatPrice(order.subtotal)}</dd>
      </div>
      {order.discountTotal > 0 && (
        <div className="flex justify-between text-success">
          <dt>İndirim</dt>
          <dd className="tabular-nums">−{formatPrice(order.discountTotal)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Kargo</dt>
        <dd className="tabular-nums">{formatPrice(order.shippingFee)}</dd>
      </div>
      <div className="flex justify-between border-t pt-2 text-base font-extrabold">
        <dt>Toplam</dt>
        <dd className="tabular-nums">{formatPrice(order.total)}</dd>
      </div>
    </dl>
  );
}

export function OrderMeta({ order }: { order: Order }) {
  const a = order.shippingAddress;
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div>
        <h3 className="eyebrow mb-2">Durum</h3>
        <div className="flex flex-wrap gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
        {order.trackingNumber && (
          <p className="mt-2 text-sm">
            Takip no: <strong>{order.trackingNumber}</strong>
          </p>
        )}
      </div>
      <div>
        <h3 className="eyebrow mb-2">Teslimat adresi</h3>
        <address className="text-sm not-italic leading-relaxed">
          {a.firstName} {a.lastName}
          <br />
          {a.addressLine}
          <br />
          {a.neighborhood}, {a.district} / {a.city}
          {a.postalCode && ` ${a.postalCode}`}
          <br />
          {a.phone}
        </address>
      </div>
      <div>
        <h3 className="eyebrow mb-2">Teslimat yöntemi</h3>
        <p className="text-sm">{order.deliveryMethod}</p>
      </div>
    </div>
  );
}

export function OrderTimeline({ order }: { order: Order }) {
  return (
    <ol className="space-y-3 border-l pl-5">
      {order.history.map((h, i) => (
        <li key={i} className="relative text-sm">
          <span
            className="absolute -left-[1.6rem] top-1.5 size-2.5 rounded-full bg-brand"
            aria-hidden
          />
          <p className="font-semibold">{orderStatusLabels[h.status].label}</p>
          <p className="text-xs text-muted-foreground">
            {formatDateTime(h.at)}
            {h.note && ` · ${h.note}`}
          </p>
        </li>
      ))}
    </ol>
  );
}
