// Helpers that turn catalog entities into UI/cart shapes.
import type { CSSProperties } from "react";
import type { Brand, CartItem, Category, Product, ProductImage, ProductVariant } from "@/types";

/** Inline style for a close-up crop of a photo (see ProductImage.focus/zoom). */
export function cropStyle(im: ProductImage | undefined, extraScale = 1): CSSProperties | undefined {
  if (!im?.focus && extraScale === 1) return undefined;
  return {
    ...(im?.focus ? { objectPosition: im.focus, transformOrigin: im.focus } : {}),
    transform: `scale(${(im?.zoom ?? 1) * extraScale})`,
  };
}

export const variantLabel = (v: ProductVariant) => v.options.map((o) => o.value).join(" / ");

export function effectivePrice(p: Product, v?: ProductVariant) {
  return {
    price: v?.price ?? p.price,
    compareAt: v
      ? (v.compareAtPrice ?? (v.price ? undefined : p.compareAtPrice))
      : p.compareAtPrice,
  };
}

export function purchasable(p: Product, v?: ProductVariant) {
  const status = v?.stockStatus ?? p.stockStatus;
  return status === "in_stock" || status === "low_stock" || status === "preorder";
}

export function maxQuantity(p: Product, v?: ProductVariant) {
  const status = v?.stockStatus ?? p.stockStatus;
  if (status === "preorder") return 5;
  return Math.max(0, Math.min(10, v?.stockQuantity ?? p.stockQuantity));
}

export function toCartItem(
  p: Product,
  brandName: string,
  v: ProductVariant | undefined,
  quantity: number,
): CartItem {
  const { price, compareAt } = effectivePrice(p, v);
  return {
    id: v ? `${p.id}:${v.id}` : p.id,
    productId: p.id,
    ...(v ? { variantId: v.id } : {}),
    categoryId: p.categoryId,
    slug: p.slug,
    title: p.title,
    brandName,
    image: p.images[0]?.url ?? "",
    sku: v?.sku ?? p.sku,
    options: v?.options ?? [],
    unitPrice: price,
    ...(compareAt ? { compareAtPrice: compareAt } : {}),
    quantity,
    maxQuantity: maxQuantity(p, v),
  };
}

export const brandNameOf = (brands: Brand[] | undefined, id: string) =>
  brands?.find((b) => b.id === id)?.name ?? "";

export function findCategory(categories: Category[] | undefined, id?: string) {
  if (!id) return undefined;
  for (const c of categories ?? []) {
    if (c.id === id) return c;
    const child = c.children?.find((x) => x.id === id);
    if (child) return child;
  }
  return undefined;
}
