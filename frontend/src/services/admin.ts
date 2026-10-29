// Admin services. Mock state lives in memory for the session only. Real authorization MUST be enforced by the backend.
import { apiRequest, mockDelay } from "./api/client";
import * as db from "@/data/mock";
import { siteConfig } from "@/config/site";
import type {
  Brand,
  Campaign,
  Category,
  Customer,
  Order,
  OrderStatus,
  PaginatedResponse,
  Product,
  SiteSettings,
  StockMovement,
} from "@/types";

export interface AdminListQuery {
  q?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  status?: string;
  category?: string;
  customerId?: string;
  stock?: string;
}

export interface AdminService {
  dashboard(): Promise<{
    periodLabel: string;
    orderCount: number;
    revenue: number;
    avgOrder: number;
    salesByDay: { day: string; revenue: number }[];
    lowStock: Product[];
    recentOrders: Order[];
    bestsellers: { product: Product; units: number }[];
  }>;
  listProducts(q: AdminListQuery): Promise<PaginatedResponse<Product>>;
  getProduct(id: string): Promise<Product | null>;
  saveProduct(p: Product): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  listCategories(): Promise<Category[]>;
  saveCategory(c: Category): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  listBrands(): Promise<Brand[]>;
  saveBrand(b: Brand): Promise<Brand>;
  deleteBrand(id: string): Promise<void>;
  listStockMovements(): Promise<StockMovement[]>;
  adjustStock(productId: string, delta: number, reason: string): Promise<Product>;
  listOrders(q: AdminListQuery): Promise<PaginatedResponse<Order>>;
  getOrder(id: string): Promise<Order | null>;
  updateOrder(
    id: string,
    patch: { status?: OrderStatus; trackingNumber?: string; note?: string },
  ): Promise<Order>;
  listCustomers(q: AdminListQuery): Promise<PaginatedResponse<Customer>>;
  getCustomer(id: string): Promise<Customer | null>;
  listCampaigns(): Promise<Campaign[]>;
  saveCampaign(c: Campaign): Promise<Campaign>;
  deleteCampaign(id: string): Promise<void>;
  getSettings(): Promise<SiteSettings>;
  saveSettings(s: SiteSettings): Promise<SiteSettings>;
}

const paginate = <T>(list: T[], page = 1, pageSize = 10): PaginatedResponse<T> => {
  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
  const p = Math.min(Math.max(1, page), totalPages);
  return {
    items: list.slice((p - 1) * pageSize, p * pageSize),
    total: list.length,
    page: p,
    pageSize,
    totalPages,
  };
};
/** Sort keys may be prefixed with "-" for descending order. */
function sortBy<T>(
  list: T[],
  sort: string | undefined,
  fallback: string,
  getters: Record<string, (x: T) => string | number>,
) {
  const raw = sort ?? fallback;
  const desc = raw.startsWith("-");
  const get = getters[desc ? raw.slice(1) : raw] ?? getters[fallback]!;
  return [...list].sort((a, b) => {
    const x = get(a),
      y = get(b);
    const c =
      typeof x === "number" && typeof y === "number"
        ? x - y
        : String(x).localeCompare(String(y), "tr");
    return desc ? -c : c;
  });
}
const has = (s: string, q?: string) =>
  !q || s.toLocaleLowerCase("tr-TR").includes(q.toLocaleLowerCase("tr-TR"));

let settings: SiteSettings = {
  storeName: siteConfig.name,
  tagline: siteConfig.tagline,
  contactEmail: siteConfig.contact.email,
  contactPhone: siteConfig.contact.phone,
  address: siteConfig.contact.address,
  freeShippingThreshold: siteConfig.shipping.freeShippingThreshold,
  flatShippingFee: siteConfig.shipping.flatEstimate,
  announcementEnabled: siteConfig.announcement.enabled,
  announcementText: siteConfig.announcement.text,
};

function salesByDay(orders: Order[]) {
  const map = new Map<string, number>();
  for (const o of orders) {
    const d = o.createdAt.slice(0, 10);
    map.set(d, (map.get(d) ?? 0) + o.total);
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, revenue]) => ({ day, revenue }));
}

export const mockAdminService: AdminService = {
  async dashboard() {
    await mockDelay(200);
    const valid = db.orders.filter((o) => o.status !== "cancelled");
    const revenue = valid.reduce((s, o) => s + o.total, 0);
    const units = new Map<string, number>();
    for (const o of valid)
      for (const it of o.items)
        units.set(it.productId, (units.get(it.productId) ?? 0) + it.quantity);
    return {
      periodLabel: "Son 30 gün (demo verisi)",
      orderCount: db.orders.length,
      revenue,
      salesByDay: salesByDay(valid),
      avgOrder: valid.length ? revenue / valid.length : 0,
      lowStock: db.products.filter((p) => p.stockQuantity <= 5).slice(0, 6),
      recentOrders: [...db.orders]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5),
      bestsellers: [...units.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id, u]) => ({ product: db.products.find((p) => p.id === id)!, units: u })),
    };
  },
  async listProducts(q) {
    await mockDelay(200);
    let l = db.products.filter((p) => has(`${p.title} ${p.sku}`, q.q));
    if (q.status) l = l.filter((p) => p.status === q.status);
    if (q.category) l = l.filter((p) => p.categoryId === q.category);
    if (q.stock) l = l.filter((p) => p.stockStatus === q.stock);
    l = sortBy(l, q.sort, "title", {
      title: (p) => p.title,
      sku: (p) => p.sku,
      price: (p) => p.price,
      stock: (p) => p.stockQuantity,
      date: (p) => p.createdAt,
    });
    return paginate(l, q.page, q.pageSize);
  },
  async getProduct(id) {
    await mockDelay(100);
    return db.products.find((p) => p.id === id) ?? null;
  },
  async saveProduct(p) {
    await mockDelay(400);
    if (db.products.some((x) => x.id !== p.id && x.slug === p.slug))
      throw new Error("Bu slug başka bir üründe kullanılıyor.");
    if (db.products.some((x) => x.id !== p.id && x.sku === p.sku))
      throw new Error("Bu SKU başka bir üründe kullanılıyor.");
    const i = db.products.findIndex((x) => x.id === p.id);
    if (i >= 0) db.products[i] = p;
    else db.products.unshift(p);
    return p;
  },
  async deleteProduct(id) {
    await mockDelay(300);
    const i = db.products.findIndex((x) => x.id === id);
    if (i >= 0) db.products.splice(i, 1);
  },
  async listCategories() {
    await mockDelay(80);
    return db.categories;
  },
  async saveCategory(c) {
    await mockDelay(300);
    const list = c.parentId
      ? db.categories.find((x) => x.id === c.parentId)?.children
      : db.categories;
    if (!list) throw new Error("Üst kategori bulunamadı.");
    const i = list.findIndex((x) => x.id === c.id);
    if (i >= 0) list[i] = { ...list[i]!, ...c };
    else list.push(c);
    return c;
  },
  async deleteCategory(id) {
    await mockDelay(300);
    if (db.products.some((p) => p.categoryId === id || p.subcategoryId === id))
      throw new Error("Bu kategoriye bağlı ürünler var. Önce ürünleri taşıyın.");
    const top = db.categories.findIndex((x) => x.id === id);
    if (top >= 0) {
      db.categories.splice(top, 1);
      return;
    }
    for (const c of db.categories) {
      const j = c.children?.findIndex((x) => x.id === id) ?? -1;
      if (j >= 0) c.children!.splice(j, 1);
    }
  },
  async listBrands() {
    await mockDelay(80);
    return db.brands;
  },
  async deleteBrand(id) {
    await mockDelay(300);
    if (db.products.some((p) => p.brandId === id))
      throw new Error("Bu markaya bağlı ürünler var. Önce ürünleri taşıyın.");
    const i = db.brands.findIndex((x) => x.id === id);
    if (i >= 0) db.brands.splice(i, 1);
  },
  async saveBrand(b) {
    await mockDelay(300);
    const i = db.brands.findIndex((x) => x.id === b.id);
    if (i >= 0) db.brands[i] = b;
    else db.brands.push(b);
    return b;
  },
  async listStockMovements() {
    await mockDelay(100);
    return [...db.stockMovements].sort((a, b) => b.at.localeCompare(a.at));
  },
  async adjustStock(productId, delta, reason) {
    await mockDelay(300);
    const p = db.products.find((x) => x.id === productId)!;
    p.stockQuantity = Math.max(0, p.stockQuantity + delta);
    p.stockStatus =
      p.stockQuantity === 0 ? "out_of_stock" : p.stockQuantity <= 5 ? "low_stock" : "in_stock";
    db.stockMovements.unshift({
      id: `sm${Date.now()}`,
      productId,
      sku: p.sku,
      delta,
      reason,
      at: new Date().toISOString(),
      by: "Demo personel",
    });
    return p;
  },
  async listOrders(q) {
    await mockDelay(200);
    let l = db.orders.filter((o) => has(`${o.number} ${o.customerName} ${o.customerEmail}`, q.q));
    if (q.customerId) l = l.filter((o) => o.customerId === q.customerId);
    if (q.status) l = l.filter((o) => o.status === q.status);
    l = sortBy(l, q.sort ?? "-date", "-date", {
      date: (o) => o.createdAt,
      total: (o) => o.total,
      number: (o) => o.number,
      customer: (o) => o.customerName,
    });
    return paginate(l, q.page, q.pageSize);
  },
  async getOrder(id) {
    await mockDelay(100);
    return db.orders.find((o) => o.id === id) ?? null;
  },
  async updateOrder(id, patch) {
    await mockDelay(300);
    const o = db.orders.find((x) => x.id === id)!;
    if (patch.trackingNumber !== undefined) o.trackingNumber = patch.trackingNumber;
    if (patch.status && patch.status !== o.status) {
      o.status = patch.status;
      o.history = [
        ...o.history,
        { status: patch.status, at: new Date().toISOString(), note: patch.note },
      ];
    }
    return { ...o };
  },
  async listCustomers(q) {
    await mockDelay(150);
    const l = sortBy(
      db.customers.filter((c) => has(`${c.firstName} ${c.lastName} ${c.email}`, q.q)),
      q.sort,
      "name",
      {
        name: (c) => `${c.firstName} ${c.lastName}`,
        orders: (c) => c.orderCount,
        spent: (c) => c.totalSpent,
        date: (c) => c.createdAt,
      },
    );
    return paginate(l, q.page, q.pageSize);
  },
  async getCustomer(id) {
    await mockDelay(100);
    return db.customers.find((c) => c.id === id) ?? null;
  },
  async listCampaigns() {
    await mockDelay(100);
    return [...db.campaigns];
  },
  async deleteCampaign(id) {
    await mockDelay(300);
    const i = db.campaigns.findIndex((x) => x.id === id);
    if (i >= 0) db.campaigns.splice(i, 1);
  },
  async getSettings() {
    await mockDelay(100);
    return settings;
  },
  async saveSettings(s) {
    await mockDelay(400);
    settings = s;
    return settings;
  },
  async saveCampaign(c) {
    await mockDelay(300);
    const i = db.campaigns.findIndex((x) => x.id === c.id);
    if (i >= 0) db.campaigns[i] = c;
    else db.campaigns.unshift(c);
    return c;
  },
};

const j = (body: unknown) => ({ method: "PUT", body: JSON.stringify(body) });
export const httpAdminService: AdminService = {
  dashboard: () => apiRequest("/admin/dashboard"),
  listProducts: (q) => apiRequest("/admin/products", { query: { ...q } }),
  getProduct: (id) => apiRequest(`/admin/products/${id}`),
  saveProduct: (p) => apiRequest(`/admin/products/${p.id}`, j(p)),
  deleteProduct: (id) => apiRequest(`/admin/products/${id}`, { method: "DELETE" }),
  listCategories: () => apiRequest("/admin/categories"),
  saveCategory: (c) => apiRequest(`/admin/categories/${c.id}`, j(c)),
  deleteCategory: (id) => apiRequest(`/admin/categories/${id}`, { method: "DELETE" }),
  listBrands: () => apiRequest("/admin/brands"),
  deleteBrand: (id) => apiRequest(`/admin/brands/${id}`, { method: "DELETE" }),
  saveBrand: (b) => apiRequest(`/admin/brands/${b.id}`, j(b)),
  listStockMovements: () => apiRequest("/admin/inventory/movements"),
  adjustStock: (productId, delta, reason) =>
    apiRequest("/admin/inventory/adjust", {
      method: "POST",
      body: JSON.stringify({ productId, delta, reason }),
    }),
  listOrders: (q) => apiRequest("/admin/orders", { query: { ...q } }),
  getOrder: (id) => apiRequest(`/admin/orders/${id}`),
  updateOrder: (id, patch) =>
    apiRequest(`/admin/orders/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  listCustomers: (q) => apiRequest("/admin/customers", { query: { ...q } }),
  getCustomer: (id) => apiRequest(`/admin/customers/${id}`),
  listCampaigns: () => apiRequest("/admin/campaigns"),
  deleteCampaign: (id) => apiRequest(`/admin/campaigns/${id}`, { method: "DELETE" }),
  getSettings: () => apiRequest("/admin/settings"),
  saveSettings: (s) => apiRequest("/admin/settings", j(s)),
  saveCampaign: (c) => apiRequest(`/admin/campaigns/${c.id}`, j(c)),
};
