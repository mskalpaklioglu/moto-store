// Turkish display labels and tone mapping for domain enums.
import type { OrderStatus, PaymentStatus, StockStatus } from "@/types";

export type Tone = "neutral" | "success" | "warning" | "danger" | "brand" | "info";

export const stockLabels: Record<StockStatus, { label: string; tone: Tone }> = {
  in_stock: { label: "Stokta", tone: "success" },
  low_stock: { label: "Son birkaç ürün", tone: "warning" },
  out_of_stock: { label: "Tükendi", tone: "danger" },
  preorder: { label: "Ön sipariş", tone: "info" },
};

export const orderStatusLabels: Record<OrderStatus, { label: string; tone: Tone }> = {
  pending: { label: "Beklemede", tone: "warning" },
  confirmed: { label: "Onaylandı", tone: "info" },
  preparing: { label: "Hazırlanıyor", tone: "info" },
  shipped: { label: "Kargoda", tone: "brand" },
  delivered: { label: "Teslim edildi", tone: "success" },
  cancelled: { label: "İptal edildi", tone: "danger" },
  returned: { label: "İade edildi", tone: "neutral" },
};

export const paymentStatusLabels: Record<PaymentStatus, { label: string; tone: Tone }> = {
  awaiting: { label: "Ödeme bekleniyor", tone: "warning" },
  paid: { label: "Ödendi", tone: "success" },
  failed: { label: "Başarısız", tone: "danger" },
  refunded: { label: "İade edildi", tone: "neutral" },
};

export const sortLabels = {
  recommended: "Önerilen",
  newest: "En yeni",
  price_asc: "Fiyat: düşükten yükseğe",
  price_desc: "Fiyat: yüksekten düşüğe",
  popular: "En çok tercih edilen",
} as const;

export const toneClasses: Record<Tone, string> = {
  neutral: "bg-secondary text-secondary-foreground",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-destructive/10 text-destructive",
  brand: "bg-brand-soft text-brand",
  info: "bg-accent text-accent-foreground",
};

export function slugify(s: string) {
  return s
    .toLocaleLowerCase("tr-TR")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
