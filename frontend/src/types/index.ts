// Domain types shared by storefront, account and admin. Mirror these in the backend contract.

export type ID = string;
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "preorder";

export interface Category {
  id: ID;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  parentId?: ID | null;
  children?: Category[];
  sortOrder: number;
}

export interface Brand {
  id: ID;
  slug: string;
  name: string;
  logo?: string;
  description?: string;
}

export interface ProductAttribute {
  key: string; // e.g. "baglanti"
  label: string; // e.g. "Bağlantı"
  value: string;
  filterable?: boolean;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface VariantOption {
  name: string; // e.g. "Renk"
  value: string; // e.g. "Mat Siyah"
}

export interface ProductVariant {
  id: ID;
  sku: string;
  barcode?: string;
  options: VariantOption[];
  price?: number; // overrides product price
  compareAtPrice?: number;
  stockStatus: StockStatus;
  stockQuantity: number;
}

export interface ProductImage {
  url: string;
  alt: string;
  /** CSS object-position / transform-origin for a close-up crop of the same photo. */
  focus?: string;
  /** Scale applied to the photo for the crop (demo data reuses one photo per category). */
  zoom?: number;
}

export type ProductStatus = "draft" | "published";

export interface Product {
  id: ID;
  slug: string;
  sku: string;
  barcode?: string;
  title: string;
  brandId: ID;
  categoryId: ID;
  subcategoryId?: ID;
  images: ProductImage[];
  price: number;
  compareAtPrice?: number;
  currency: "TRY";
  stockStatus: StockStatus;
  stockQuantity: number;
  shortDescription: string;
  description: string;
  attributes: ProductAttribute[];
  specifications: ProductSpec[];
  compatibility?: string[];
  variants: ProductVariant[];
  tags: string[];
  isFeatured?: boolean;
  isNew?: boolean;
  popularity: number;
  rating?: { average: number; count: number };
  status: ProductStatus;
  createdAt: string;
}

export interface CartItem {
  id: string; // productId:variantId
  productId: ID;
  variantId?: ID;
  categoryId?: ID;
  slug: string;
  title: string;
  brandName: string;
  image: string;
  sku: string;
  options: VariantOption[];
  unitPrice: number;
  compareAtPrice?: number;
  quantity: number;
  maxQuantity: number;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  discountTotal: number; // savings from compareAtPrice
  couponDiscount: number;
  shippingEstimate: number | null;
  total: number;
}

export interface Cart {
  items: CartItem[];
  totals: CartTotals;
}

export interface Address {
  id: ID;
  title: string;
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  district: string;
  neighborhood: string;
  addressLine: string;
  postalCode?: string;
  isDefault?: boolean;
}

export interface Customer {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

export type OrderStatus =
  "pending" | "confirmed" | "preparing" | "shipped" | "delivered" | "cancelled" | "returned";
export type PaymentStatus = "awaiting" | "paid" | "failed" | "refunded";

export interface OrderItem {
  productId: ID;
  variantId?: ID;
  title: string;
  sku: string;
  options: VariantOption[];
  unitPrice: number;
  quantity: number;
  image?: string;
}

export interface OrderStatusEvent {
  status: OrderStatus;
  at: string;
  note?: string;
}

export interface Order {
  id: ID;
  number: string;
  customerId: ID;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  shippingAddress: Omit<Address, "id" | "title" | "isDefault">;
  deliveryMethod: string;
  subtotal: number;
  shippingFee: number;
  discountTotal: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  trackingNumber?: string;
  history: OrderStatusEvent[];
  createdAt: string;
}

export type DiscountType = "percentage" | "fixed";

export interface Campaign {
  id: ID;
  name: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minCartAmount?: number;
  startsAt: string;
  endsAt: string;
  eligibleCategoryIds: ID[];
  eligibleProductIds: ID[];
  isActive: boolean;
}

export interface Review {
  id: ID;
  productId: ID;
  author: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  isDemo: true;
}

export interface Article {
  id: ID;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  readMinutes: number;
  category: string;
}

export interface StockMovement {
  id: ID;
  productId: ID;
  sku: string;
  delta: number;
  reason: string;
  at: string;
  by: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  status: number;
  code:
    | "validation_error"
    | "unauthorized"
    | "forbidden"
    | "not_found"
    | "server_error"
    | "network_error";
  message: string;
  fieldErrors?: Record<string, string>;
}

export type SortKey = "recommended" | "newest" | "price_asc" | "price_desc" | "popular";

export interface ProductQuery {
  q?: string;
  category?: string; // slug
  subcategory?: string; // slug
  brands?: string[]; // slugs
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
  attrs?: Record<string, string[]>;
  sort?: SortKey;
  page?: number;
  pageSize?: number;
}

export interface FacetValue {
  value: string;
  label: string;
  count: number;
}

export interface ProductFacets {
  brands: FacetValue[];
  attributes: { key: string; label: string; values: FacetValue[] }[];
  priceRange: { min: number; max: number };
}

export type AdminRole = "admin" | "staff";

export interface CheckoutRequest {
  contact: { email: string; phone: string; firstName: string; lastName: string };
  address: Omit<Address, "id" | "title" | "isDefault">;
  deliveryMethodId: string;
  items: { productId: ID; variantId?: ID; quantity: number }[];
  note?: string;
}

export interface CheckoutResult {
  mode: "demo";
  reference: string;
  message: string;
}

export interface DeliveryMethod {
  id: string;
  name: string;
  description: string;
  fee: number | null; // null = to be calculated by backend
}

export interface SiteSettings {
  storeName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  freeShippingThreshold: number | null;
  flatShippingFee: number;
  announcementEnabled: boolean;
  announcementText: string;
}
