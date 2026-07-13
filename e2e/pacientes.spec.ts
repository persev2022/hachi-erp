import { test, expect } from "@playwright/test";

test.describe("Pacientes Module", () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.fill('input[type="email"], input[name="email"]', "admin@hachi.com");
    await page.fill('input[type="password"], input[name="password"]', "Admin@2026");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard**", { timeout: 10000 });
  });

  test("should navigate to pacientes page", async ({ page }) => {
    await page.goto("/pacientes");
    await expect(page).toHaveURL(/pacientes/);
    await expect(page.locator("main")).toBeVisible();
  });

  test("should navigate to new patient form", async ({ page }) => {
    await page.goto("/pacientes/novo");
    await expect(page).toHaveURL(/pacientes\/novo/);
    // Form should have name field
    await expect(page.locator('input[name="nome"], input[placeholder*="nome" i]').first()).toBeVisible({ timeout: 5000 });
  });

  test("should list patients from current tenant", async ({ page }) => {
    await page.goto("/pacientes");
    await page.waitForTimeout(2000);
    // Should display table or cards or empty state
    const hasContent = await page.locator("table, [class*=card], [class*=empty]").count();
    expect(hasContent).toBeGreaterThan(0);
  });
});
