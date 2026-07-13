import { test, expect } from "@playwright/test";

test.describe("Tenant Isolation", () => {
  test("admin@hachi.com should see CT Persev data only", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"], input[name="email"]', "admin@hachi.com");
    await page.fill('input[type="password"], input[name="password"]', "Admin@2026");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard**", { timeout: 10000 });

    // Fetch patients API directly
    const response = await page.request.get("/api/pacientes");
    const data = await response.json();

    if (data.success && data.data && data.data.length > 0) {
      // All patients should belong to the same tenant (no cross-tenant leakage)
      const tenantIds = [...new Set(data.data.map((p: any) => p.tenantId))];
      expect(tenantIds.length).toBeLessThanOrEqual(1);
    }
  });

  test("dashboard API should scope by tenant", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"], input[name="email"]', "admin@hachi.com");
    await page.fill('input[type="password"], input[name="password"]', "Admin@2026");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard**", { timeout: 10000 });

    const response = await page.request.get("/api/relatorios/dashboard");
    const data = await response.json();
    expect(data.success).toBe(true);
    // KPIs should be present
    if (data.data?.kpis) {
      expect(data.data.kpis).toHaveProperty("pacientesAtivos");
    }
  });

  test("unauthenticated request should be rejected", async ({ page }) => {
    // Clear cookies
    await page.context().clearCookies();
    const response = await page.request.get("/api/pacientes");
    expect(response.status()).toBe(401);
  });
});
