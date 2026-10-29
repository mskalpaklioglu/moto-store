// URL search-param contract shared by /urunler, /kategori/$slug and /arama.
import { z } from "zod";
import type { ProductQuery, SortKey } from "@/types";

const sortKeys = ["recommended", "newest", "price_asc", "price_desc", "popular"] as const;

export const listingSearchSchema = z.object({
  q: z.string().optional().catch(undefined),
  alt: z.string().optional().catch(undefined),
  marka: z.array(z.string()).optional().catch(undefined),
  min: z.number().nonnegative().optional().catch(undefined),
  max: z.number().nonnegative().optional().catch(undefined),
  stok: z.boolean().optional().catch(undefined),
  indirim: z.boolean().optional().catch(undefined),
  ozellik: z.array(z.string()).optional().catch(undefined), // "key:value"
  sirala: z.enum(sortKeys).optional().catch(undefined),
  sayfa: z.number().int().min(1).optional().catch(undefined),
});

export type ListingSearch = z.infer<typeof listingSearchSchema>;

export const validateListingSearch = (s: Record<string, unknown>): ListingSearch =>
  listingSearchSchema.parse(s);

export const PAGE_SIZE = 12;

export function toProductQuery(s: ListingSearch, categorySlug?: string): ProductQuery {
  const attrs: Record<string, string[]> = {};
  for (const pair of s.ozellik ?? []) {
    const i = pair.indexOf(":");
    if (i < 1) continue;
    const key = pair.slice(0, i);
    (attrs[key] ??= []).push(pair.slice(i + 1));
  }
  return {
    ...(s.q ? { q: s.q } : {}),
    ...(categorySlug ? { category: categorySlug } : {}),
    ...(s.alt ? { subcategory: s.alt } : {}),
    ...(s.marka?.length ? { brands: s.marka } : {}),
    ...(s.min != null ? { minPrice: s.min } : {}),
    ...(s.max != null ? { maxPrice: s.max } : {}),
    ...(s.stok ? { inStock: true } : {}),
    ...(s.indirim ? { onSale: true } : {}),
    ...(Object.keys(attrs).length ? { attrs } : {}),
    sort: (s.sirala ?? "recommended") as SortKey,
    page: s.sayfa ?? 1,
    pageSize: PAGE_SIZE,
  };
}
