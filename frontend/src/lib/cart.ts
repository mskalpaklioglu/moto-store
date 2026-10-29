// Pure cart math. Display only — the backend must recompute prices, coupons and totals for real orders.
import type { Campaign, CartItem, CartTotals } from "@/types";

const round = (n: number) => Math.round(n * 100) / 100;

export function couponDiscount(coupon: Campaign | null, items: CartItem[]): number {
  if (!coupon) return 0;
  const restricted = coupon.eligibleCategoryIds.length > 0 || coupon.eligibleProductIds.length > 0;
  const eligible = items.filter(
    (i) =>
      !restricted ||
      coupon.eligibleProductIds.includes(i.productId) ||
      (i.categoryId && coupon.eligibleCategoryIds.includes(i.categoryId)),
  );
  const base = eligible.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const cartSubtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  if (!base || (coupon.minCartAmount && cartSubtotal < coupon.minCartAmount)) return 0;
  const raw =
    coupon.discountType === "percentage"
      ? (base * coupon.discountValue) / 100
      : coupon.discountValue;
  return round(Math.min(raw, base));
}

/** Why an applied coupon yields no discount for the current cart, or null if it applies. */
export function couponProblem(
  coupon: Campaign | null,
  items: CartItem[],
): "min" | "ineligible" | null {
  if (!coupon || items.length === 0) return null;
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  if (coupon.minCartAmount && subtotal < coupon.minCartAmount) return "min";
  return couponDiscount(coupon, items) === 0 ? "ineligible" : null;
}

export function computeTotals(
  items: CartItem[],
  shippingEstimate: number | null,
  freeThreshold: number | null = null,
  coupon: Campaign | null = null,
): CartTotals {
  const subtotal = round(items.reduce((s, i) => s + i.unitPrice * i.quantity, 0));
  const discountTotal = round(
    items.reduce(
      (s, i) =>
        s +
        (i.compareAtPrice && i.compareAtPrice > i.unitPrice
          ? (i.compareAtPrice - i.unitPrice) * i.quantity
          : 0),
      0,
    ),
  );
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const discount = couponDiscount(coupon, items);
  const shipping =
    items.length === 0
      ? 0
      : freeThreshold != null && subtotal - discount >= freeThreshold
        ? 0
        : shippingEstimate;
  return {
    itemCount,
    subtotal,
    discountTotal,
    couponDiscount: discount,
    shippingEstimate: shipping,
    total: round(subtotal - discount + (shipping ?? 0)),
  };
}

export function addItem(items: CartItem[], item: CartItem): CartItem[] {
  const existing = items.find((i) => i.id === item.id);
  if (existing)
    return items.map((i) =>
      i.id === item.id
        ? { ...i, quantity: Math.min(i.maxQuantity, i.quantity + item.quantity) }
        : i,
    );
  return [...items, { ...item, quantity: Math.min(item.maxQuantity, item.quantity) }];
}

export function setQuantity(items: CartItem[], id: string, qty: number): CartItem[] {
  if (qty <= 0) return items.filter((i) => i.id !== id);
  return items.map((i) => (i.id === id ? { ...i, quantity: Math.min(i.maxQuantity, qty) } : i));
}
