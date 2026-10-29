// Checkout, auth, account, newsletter services. Mock versions never take payment or create real orders.
import { apiRequest, ApiRequestError, mockDelay } from "./api/client";
import * as db from "@/data/mock";
import type {
  Address,
  Campaign,
  CheckoutRequest,
  CheckoutResult,
  Customer,
  DeliveryMethod,
  Order,
} from "@/types";

export interface CheckoutService {
  listDeliveryMethods(): Promise<DeliveryMethod[]>;
  /** Looks up a coupon by code. Backend must validate dates, limits and eligibility. */
  findCoupon(code: string): Promise<Campaign | null>;
  /** Backend must re-price items, validate stock and create the order + payment session. */
  submit(req: CheckoutRequest): Promise<CheckoutResult>;
}

export interface AuthService {
  getSession(): Promise<{ customer: Customer } | null>;
  signIn(email: string, password: string): Promise<{ customer: Customer }>;
  signUp(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<{ customer: Customer }>;
  requestPasswordReset(email: string): Promise<void>;
  signOut(): Promise<void>;
}

export interface AccountService {
  getDemoProfile(): Promise<Customer>;
  listAddresses(): Promise<Address[]>;
  listOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | null>;
}

export interface NewsletterService {
  subscribe(email: string): Promise<void>;
}

const notConnected = (what: string) =>
  new ApiRequestError({
    status: 503,
    code: "server_error",
    message: `${what} henüz bağlı değil. Bu bir demo arayüzdür.`,
  });

export const mockCheckoutService: CheckoutService = {
  async findCoupon(code) {
    await mockDelay(400);
    const now = Date.now();
    const c = db.campaigns.find((x) => x.code.toLowerCase() === code.trim().toLowerCase());
    if (!c || !c.isActive || Date.parse(c.startsAt) > now || Date.parse(c.endsAt) < now)
      return null;
    return c;
  },
  async listDeliveryMethods() {
    await mockDelay(100);
    return [
      {
        id: "standard",
        name: "Standart kargo",
        description: "Kargo firması ve süre entegrasyon sonrası netleşecek.",
        fee: 89.9,
      },
      {
        id: "express",
        name: "Hızlı kargo",
        description: "Uygunluk adresinize göre hesaplanacak.",
        fee: 149.9,
      },
      {
        id: "pickup",
        name: "Mağazadan teslim",
        description: "Teslim noktaları belirlendiğinde aktif olacak.",
        fee: 0,
      },
    ];
  },
  async submit(req) {
    await mockDelay(900);
    if (req.contact.email.toLowerCase().includes("hata")) throw notConnected("Sipariş servisi");
    return {
      mode: "demo",
      reference: `DEMO-${Date.now().toString().slice(-6)}`,
      message: "Demo gönderimi tamamlandı. Gerçek sipariş oluşturulmadı ve ödeme alınmadı.",
    };
  },
};

export const mockAuthService: AuthService = {
  async getSession() {
    return null;
  },
  async signIn() {
    await mockDelay(600);
    throw notConnected("Giriş servisi");
  },
  async signUp() {
    await mockDelay(600);
    throw notConnected("Kayıt servisi");
  },
  async requestPasswordReset() {
    await mockDelay(600);
  },
  async signOut() {},
};

export const mockAccountService: AccountService = {
  async getDemoProfile() {
    await mockDelay(100);
    return db.customers[0]!;
  },
  async listAddresses() {
    await mockDelay(100);
    return [
      {
        id: "ad1",
        title: "Ev (örnek)",
        firstName: "Ayşe",
        lastName: "Yılmaz",
        phone: "+90 5xx xxx xx xx",
        city: "İstanbul",
        district: "Kadıköy",
        neighborhood: "Örnek Mah.",
        addressLine: "Örnek Sok. No: 1 D: 2",
        postalCode: "34000",
        isDefault: true,
      },
      {
        id: "ad2",
        title: "İş (örnek)",
        firstName: "Ayşe",
        lastName: "Yılmaz",
        phone: "+90 5xx xxx xx xx",
        city: "Ankara",
        district: "Çankaya",
        neighborhood: "Örnek Mah.",
        addressLine: "Örnek Cad. No: 10",
        isDefault: false,
      },
    ];
  },
  async listOrders() {
    await mockDelay(150);
    return db.orders.filter((o) => o.customerId === "u1" || o.customerId === "u2").slice(0, 4);
  },
  async getOrder(id) {
    await mockDelay(100);
    return db.orders.find((o) => o.id === id) ?? null;
  },
};

export const mockNewsletterService: NewsletterService = {
  async subscribe() {
    await mockDelay(500);
  },
};

export const httpCheckoutService: CheckoutService = {
  findCoupon: (code) => apiRequest(`/checkout/coupons/${encodeURIComponent(code)}`),
  listDeliveryMethods: () => apiRequest("/checkout/delivery-methods"),
  submit: (req) => apiRequest("/checkout", { method: "POST", body: JSON.stringify(req) }),
};
export const httpAuthService: AuthService = {
  getSession: () => apiRequest("/auth/session"),
  signIn: (email, password) =>
    apiRequest("/auth/sign-in", { method: "POST", body: JSON.stringify({ email, password }) }),
  signUp: (d) => apiRequest("/auth/sign-up", { method: "POST", body: JSON.stringify(d) }),
  requestPasswordReset: (email) =>
    apiRequest("/auth/password-reset", { method: "POST", body: JSON.stringify({ email }) }),
  signOut: () => apiRequest("/auth/sign-out", { method: "POST" }),
};
export const httpAccountService: AccountService = {
  getDemoProfile: () => apiRequest("/me"),
  listAddresses: () => apiRequest("/me/addresses"),
  listOrders: () => apiRequest("/me/orders"),
  getOrder: (id) => apiRequest(`/me/orders/${id}`),
};
export const httpNewsletterService: NewsletterService = {
  subscribe: (email) =>
    apiRequest("/newsletter", { method: "POST", body: JSON.stringify({ email }) }),
};
