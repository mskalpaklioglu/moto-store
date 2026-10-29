import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/urunler",
  "/kategoriler",
  "/kategori/kask-koruma",
  "/arama?q=interkom",
  "/urun/kapali-kask-model-r1",
  "/sepet",
  "/odeme",
  "/giris",
  "/kayit",
  "/hesap",
  "/hesap/siparisler/o1",
  "/favoriler",
  "/iletisim",
  "/sss",
  "/bilgi/kvkk",
  "/admin",
  "/admin/urunler",
  "/admin/urunler/yeni",
  "/admin/kategoriler",
  "/admin/markalar",
  "/admin/stok",
  "/admin/siparisler",
  "/admin/siparisler/o1",
  "/admin/musteriler",
  "/admin/musteriler/u1",
  "/admin/kampanyalar",
  "/admin/ayarlar",
];

for (const r of routes) {
  test(`route ${r} renders`, async ({ page }) => {
    const res = await page.goto(r);
    expect(res?.status()).toBeLessThan(400);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
}

test("category menu fits and opens", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Tüm kategoriler" });
  await trigger.hover();
  await expect(page.getByRole("link", { name: "Kasklar" }).first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test("listing filters, sorting and pagination work", async ({ page }) => {
  await page.goto("/urunler");
  await expect(page.locator("article")).toHaveCount(12);
  await page.locator("#brand-atlas").check();
  await expect(page.locator("article")).toHaveCount(5);
  await page.getByText("Tümünü temizle").click();
  await expect(page.locator("article")).toHaveCount(12);
  await page.getByRole("button", { name: "Sonraki sayfa" }).click();
  await expect(page).toHaveURL(/sayfa=2/);
});

test("cart, coupon and checkout validation", async ({ page }) => {
  await page.goto("/urun/kapali-kask-model-r1");
  await page
    .getByRole("button", { name: /Sepete ekle/ })
    .first()
    .click();
  await page.goto("/sepet");
  await page.getByLabel("İndirim kodu").fill("ORNEK10");
  await page.getByRole("button", { name: "Uygula" }).click();
  await expect(page.getByText(/İndirim kodu \(ORNEK10\)/)).toBeVisible();
  await page.getByRole("link", { name: "Ödemeye geç" }).click();
  await page.getByRole("button", { name: "Devam et" }).click();
  await expect(page.getByRole("alert").first()).toBeVisible();
});

test("admin product create and delete", async ({ page }) => {
  await page.goto("/admin/urunler/yeni");
  await page.getByLabel("Ürün adı *").fill("E2E Test Ürünü");
  await page.getByLabel("SKU *", { exact: true }).fill("E2E-0001");
  await page.getByLabel("Kategori *", { exact: true }).selectOption({ index: 1 });
  await page.getByLabel("Marka *", { exact: true }).selectOption({ index: 1 });
  await page.getByRole("tab", { name: /Fiyat ve stok/ }).click();
  await page.getByLabel("Satış fiyatı (₺) *").fill("500");
  await page.getByLabel("Stok adedi *").fill("3");
  await page.getByRole("tab", { name: /Genel/ }).click();
  await page.getByLabel("Kısa açıklama *").fill("Kısa demo açıklama metni");
  await page.getByLabel("Ayrıntılı açıklama *").fill("E2E testi için oluşturulan ürün açıklaması.");
  await page.getByRole("tab", { name: /Görseller/ }).click();
  await page.getByRole("combobox", { name: "Demo görsel ekle" }).selectOption({ index: 1 });
  await page.getByRole("button", { name: "Ürünü oluştur" }).click();
  await expect(page).toHaveURL(/\/admin\/urunler$/);
  await page.getByPlaceholder("Ürün adı veya SKU ara").fill("E2E-0001");
  await expect(page.locator("tbody").getByText("E2E Test Ürünü")).toBeVisible();
  await page.getByRole("button", { name: /E2E Test Ürünü sil/ }).click();
  await page.getByRole("button", { name: "Sil", exact: true }).click();
  await expect(page.locator("tbody").getByText("E2E Test Ürünü")).toHaveCount(0);
});

test("adding to cart opens the mini cart drawer", async ({ page }) => {
  await page.goto("/urun/kapali-kask-model-r1");
  await page.getByRole("button", { name: "Sepete ekle" }).first().click();
  const drawer = page.getByRole("dialog");
  await expect(drawer.getByText("Kapalı Kask Model R1")).toBeVisible();
  await expect(drawer.getByRole("link", { name: "Ödemeye geç" })).toBeVisible();
});

test("home showcase tabs switch products", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "İndirimdekiler" }).click();
  await expect(page.getByRole("tabpanel").locator("article").first()).toBeVisible();
});

test("admin edit form keeps saved category and brand, and validates across tabs", async ({
  page,
}) => {
  await page.goto("/admin/urunler/p1");
  await expect(page.getByLabel("Kategori *", { exact: true })).toHaveValue("c1");
  await expect(page.getByLabel("Marka *", { exact: true })).toHaveValue("b1");
  await page.getByRole("tab", { name: /Fiyat ve stok/ }).click();
  await page.getByLabel("Satış fiyatı (₺) *").fill("");
  await page.getByRole("tab", { name: /Genel/ }).click();
  await page.getByRole("button", { name: "Değişiklikleri kaydet" }).click();
  await expect(page.getByRole("tab", { name: /Fiyat ve stok/ })).toHaveAttribute(
    "data-state",
    "active",
  );
});

test("product page exposes SEO metadata and JSON-LD", async ({ page }) => {
  await page.goto("/urun/kapali-kask-model-r1");
  await expect(page).toHaveTitle(/Kapalı Kask Model R1/);
  const ld = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(JSON.parse(ld ?? "{}")["@type"]).toBe("Product");
});

test.describe("mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test("bottom navigation is shown and opens the cart", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Hızlı gezinme" });
    await expect(nav).toBeVisible();
    // Retry: the click can land before the page has hydrated.
    await expect(async () => {
      await nav.getByRole("button", { name: /Sepet/ }).click();
      await expect(page.getByRole("dialog")).toBeVisible({ timeout: 1500 });
    }).toPass({ timeout: 15_000 });
  });
});

test("search shows popular queries before typing", async ({ page }) => {
  await page.goto("/");
  const input = page.getByRole("search").first().locator("input");
  await expect(async () => {
    await input.click();
    await expect(page.getByText("Popüler aramalar")).toBeVisible({ timeout: 1500 });
  }).toPass({ timeout: 15_000 });
});
