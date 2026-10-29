// Catalog service: products, categories, brands, search, reviews, articles.
import { apiRequest, mockDelay } from "./api/client";
import * as db from "@/data/mock";
import { trLower } from "@/lib/format";
import type {
  Article,
  Brand,
  Category,
  PaginatedResponse,
  Product,
  ProductFacets,
  ProductQuery,
  Review,
} from "@/types";

export interface CatalogService {
  listCategories(): Promise<Category[]>;
  listBrands(): Promise<Brand[]>;
  listProducts(q: ProductQuery): Promise<PaginatedResponse<Product> & { facets: ProductFacets }>;
  getProduct(slug: string): Promise<Product | null>;
  getProductsByIds(ids: string[]): Promise<Product[]>;
  getRelated(productId: string, limit?: number): Promise<Product[]>;
  suggest(term: string): Promise<{ products: Product[]; categories: Category[]; brands: Brand[] }>;
  listReviews(productId: string): Promise<Review[]>;
  listArticles(): Promise<Article[]>;
}

const published = () => db.products.filter((p) => p.status === "published");
const brandOf = (p: Product) => db.brands.find((b) => b.id === p.brandId);
const catBySlug = (slug?: string) => db.categories.find((c) => c.slug === slug);

function matchesTerm(p: Product, term: string) {
  const t = trLower(term.trim());
  if (!t) return true;
  const hay = trLower(
    [p.title, p.sku, brandOf(p)?.name, db.categories.find((c) => c.id === p.categoryId)?.name].join(
      " ",
    ),
  );
  return t.split(/\s+/).every((w) => hay.includes(w));
}

export function filterProducts(all: Product[], q: ProductQuery, ignore?: "brands" | "attrs") {
  const cat = catBySlug(q.category);
  const subId = cat && q.subcategory ? `${cat.id}-${q.subcategory}` : undefined;
  return all.filter((p) => {
    if (q.q && !matchesTerm(p, q.q)) return false;
    if (cat && p.categoryId !== cat.id) return false;
    if (subId && p.subcategoryId !== subId) return false;
    if (ignore !== "brands" && q.brands?.length && !q.brands.includes(brandOf(p)?.slug ?? ""))
      return false;
    if (q.minPrice != null && p.price < q.minPrice) return false;
    if (q.maxPrice != null && p.price > q.maxPrice) return false;
    if (q.onSale && !(p.compareAtPrice && p.compareAtPrice > p.price)) return false;
    if (q.inStock && (p.stockStatus === "out_of_stock" || p.stockStatus === "preorder"))
      return false;
    if (ignore !== "attrs" && q.attrs) {
      for (const [key, vals] of Object.entries(q.attrs)) {
        if (!vals.length) continue;
        const a = p.attributes.find((x) => x.key === key);
        if (!a || !vals.includes(a.value)) return false;
      }
    }
    return true;
  });
}

export function sortProducts(list: Product[], sort: ProductQuery["sort"] = "recommended") {
  const l = [...list];
  switch (sort) {
    case "newest":
      return l.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "price_asc":
      return l.sort((a, b) => a.price - b.price);
    case "price_desc":
      return l.sort((a, b) => b.price - a.price);
    case "popular":
      return l.sort((a, b) => b.popularity - a.popularity);
    default:
      return l.sort(
        (a, b) => Number(!!b.isFeatured) - Number(!!a.isFeatured) || b.popularity - a.popularity,
      );
  }
}

function facets(q: ProductQuery): ProductFacets {
  const base = filterProducts(published(), {
    ...q,
    brands: undefined,
    attrs: undefined,
    minPrice: undefined,
    maxPrice: undefined,
  });
  const forBrands = filterProducts(published(), q, "brands");
  const forAttrs = filterProducts(published(), q, "attrs");
  const brandCounts = db.brands
    .map((b) => ({
      value: b.slug,
      label: b.name,
      count: forBrands.filter((p) => p.brandId === b.id).length,
    }))
    .filter((b) => b.count > 0 || q.brands?.includes(b.value));
  const attrMap = new Map<string, { label: string; values: Map<string, number> }>();
  for (const p of base)
    for (const a of p.attributes) {
      if (!a.filterable) continue;
      if (!attrMap.has(a.key)) attrMap.set(a.key, { label: a.label, values: new Map() });
      attrMap.get(a.key)!.values.set(a.value, 0);
    }
  for (const p of forAttrs)
    for (const a of p.attributes) {
      const e = attrMap.get(a.key);
      if (e) e.values.set(a.value, (e.values.get(a.value) ?? 0) + 1);
    }
  const prices = base.map((p) => p.price);
  return {
    brands: brandCounts,
    attributes: [...attrMap.entries()]
      .filter(([, v]) => v.values.size > 1)
      .map(([key, v]) => ({
        key,
        label: v.label,
        values: [...v.values.entries()].map(([value, count]) => ({ value, label: value, count })),
      })),
    priceRange: {
      min: prices.length ? Math.floor(Math.min(...prices)) : 0,
      max: prices.length ? Math.ceil(Math.max(...prices)) : 0,
    },
  };
}

export const mockCatalogService: CatalogService = {
  async listCategories() {
    await mockDelay(50);
    return db.categories;
  },
  async listBrands() {
    await mockDelay(50);
    return db.brands;
  },
  async listProducts(q) {
    await mockDelay(300);
    const pageSize = q.pageSize ?? 12;
    const filtered = sortProducts(filterProducts(published(), q), q.sort);
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const page = Math.min(Math.max(1, q.page ?? 1), totalPages);
    return {
      items: filtered.slice((page - 1) * pageSize, page * pageSize),
      total: filtered.length,
      page,
      pageSize,
      totalPages,
      facets: facets(q),
    };
  },
  async getProduct(slug) {
    await mockDelay(150);
    return published().find((p) => p.slug === slug) ?? null;
  },
  async getProductsByIds(ids) {
    await mockDelay(50);
    return ids.map((id) => db.products.find((p) => p.id === id)).filter(Boolean) as Product[];
  },
  async getRelated(productId, limit = 4) {
    await mockDelay(100);
    const p = db.products.find((x) => x.id === productId);
    return published()
      .filter((x) => x.id !== productId && x.categoryId === p?.categoryId)
      .concat(published().filter((x) => x.categoryId !== p?.categoryId))
      .slice(0, limit);
  },
  async suggest(term) {
    await mockDelay(80);
    const t = trLower(term.trim());
    if (!t) return { products: [], categories: [], brands: [] };
    return {
      products: published()
        .filter((p) => matchesTerm(p, term))
        .slice(0, 6),
      categories: db.categories.filter((c) => trLower(c.name).includes(t)).slice(0, 3),
      brands: db.brands.filter((b) => trLower(b.name).includes(t)).slice(0, 3),
    };
  },
  async listReviews(productId) {
    await mockDelay(100);
    return db.reviews.map((r) => ({ ...r, productId }));
  },
  async listArticles() {
    await mockDelay(50);
    return db.articles;
  },
};

export const httpCatalogService: CatalogService = {
  listCategories: () => apiRequest("/categories"),
  listBrands: () => apiRequest("/brands"),
  listProducts: (q) => apiRequest("/products", { query: q as Record<string, unknown> }),
  getProduct: (slug) => apiRequest(`/products/${slug}`),
  getProductsByIds: (ids) => apiRequest("/products", { query: { ids } }),
  getRelated: (id, limit) => apiRequest(`/products/${id}/related`, { query: { limit } }),
  suggest: (term) => apiRequest("/search/suggest", { query: { q: term } }),
  listReviews: (id) => apiRequest(`/products/${id}/reviews`),
  listArticles: () => apiRequest("/articles"),
};

export const brandName = (brandId: string, list: Brand[] = db.brands) =>
  list.find((b) => b.id === brandId)?.name ?? "";
