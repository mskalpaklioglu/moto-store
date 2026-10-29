// Centralized HTTP client for the separately developed backend.
// Set VITE_API_BASE_URL to switch services from mock to HTTP (see src/services/index.ts).
import type { ApiError } from "@/types";

export const API_BASE_URL: string | undefined = import.meta.env.VITE_API_BASE_URL || undefined;
export const USE_MOCKS = !API_BASE_URL;

export class ApiRequestError extends Error {
  constructor(public error: ApiError) {
    super(error.message);
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit & { query?: Record<string, unknown> } = {},
): Promise<T> {
  if (!API_BASE_URL)
    throw new ApiRequestError({
      status: 0,
      code: "network_error",
      message: "API adresi yapılandırılmadı.",
    });
  const url = new URL(path, API_BASE_URL);
  for (const [k, v] of Object.entries(init.query ?? {})) {
    if (v === undefined || v === null || v === "") continue;
    url.searchParams.set(
      k,
      Array.isArray(v) ? v.join(",") : typeof v === "object" ? JSON.stringify(v) : String(v),
    );
  }
  let res: Response;
  try {
    res = await fetch(url, {
      credentials: "include",
      ...init,
      headers: { "Content-Type": "application/json", ...init.headers },
    });
  } catch {
    throw new ApiRequestError({
      status: 0,
      code: "network_error",
      message: "Sunucuya ulaşılamadı. Bağlantınızı kontrol edin.",
    });
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as Partial<ApiError>;
    const code: ApiError["code"] =
      res.status === 401
        ? "unauthorized"
        : res.status === 403
          ? "forbidden"
          : res.status === 404
            ? "not_found"
            : res.status === 422
              ? "validation_error"
              : "server_error";
    throw new ApiRequestError({
      status: res.status,
      code,
      message: body.message ?? "Beklenmeyen bir hata oluştu.",
      fieldErrors: body.fieldErrors,
    });
  }
  return (await res.json()) as T;
}

export const mockDelay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export function errorMessage(e: unknown) {
  if (e instanceof ApiRequestError) return e.error.message;
  return "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.";
}
