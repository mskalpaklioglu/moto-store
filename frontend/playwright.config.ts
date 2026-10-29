import { defineConfig } from "@playwright/test";

// Uses the locally installed Chrome (no browser download). Set E2E_BASE_URL to test a running server.
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:5199";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: true,
  workers: 2,
  expect: { timeout: 15_000 },
  use: { baseURL, channel: "chrome", locale: "tr-TR", viewport: { width: 1366, height: 900 } },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npm run dev -- --port 5199",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
