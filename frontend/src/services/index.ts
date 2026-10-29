// Service registry: components import from here. Mocks are used until VITE_API_BASE_URL is set.
import { USE_MOCKS } from "./api/client";
import { httpCatalogService, mockCatalogService } from "./catalog";
import {
  httpAccountService,
  httpAuthService,
  httpCheckoutService,
  httpNewsletterService,
  mockAccountService,
  mockAuthService,
  mockCheckoutService,
  mockNewsletterService,
} from "./commerce";
import { httpAdminService, mockAdminService } from "./admin";

export const catalog = USE_MOCKS ? mockCatalogService : httpCatalogService;
export const checkout = USE_MOCKS ? mockCheckoutService : httpCheckoutService;
export const auth = USE_MOCKS ? mockAuthService : httpAuthService;
export const account = USE_MOCKS ? mockAccountService : httpAccountService;
export const newsletter = USE_MOCKS ? mockNewsletterService : httpNewsletterService;
export const admin = USE_MOCKS ? mockAdminService : httpAdminService;
export { USE_MOCKS };
