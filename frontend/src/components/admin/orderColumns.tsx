import { Link } from "@tanstack/react-router";
import type { Column } from "@/components/admin/parts";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/common/StatusBadge";
import { formatDateTime, formatPrice } from "@/lib/format";
import type { Order } from "@/types";

export const orderColumns: Column<Order>[] = [
  {
    key: "number",
    header: "Sipariş",
    sortKey: "number",
    cell: (o) => (
      <Link to="/admin/siparisler/$id" params={{ id: o.id }} className="font-bold hover:text-brand">
        {o.number}
      </Link>
    ),
  },
  { key: "date", header: "Tarih", sortKey: "date", cell: (o) => formatDateTime(o.createdAt) },
  {
    key: "customer",
    header: "Müşteri",
    sortKey: "customer",
    cell: (o) => (
      <div>
        <p className="font-semibold">{o.customerName}</p>
        <p className="text-xs text-muted-foreground">{o.customerEmail}</p>
      </div>
    ),
  },
  { key: "status", header: "Durum", cell: (o) => <OrderStatusBadge status={o.status} /> },
  { key: "pay", header: "Ödeme", cell: (o) => <PaymentStatusBadge status={o.paymentStatus} /> },
  {
    key: "total",
    header: "Toplam",
    sortKey: "total",
    align: "right",
    cell: (o) => <strong>{formatPrice(o.total)}</strong>,
  },
];
