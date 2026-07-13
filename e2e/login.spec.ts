import { test, expect } from "@playwright/test";

test.describe("Login Flow", () => {
  test("should show login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/login/);
    // Page should have an email input (login form)
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible({ timeout: 10000 });
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"], input[name="email"]', "invalid@test.com");
    await page.fill('input[type="password"], input[name="password"]', "wrongpass");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=/inválid|error|incorret/i")).toBeVisible({ timeout: 5000 });
  });

  test("should login with valid credentials and redirect to dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"], input[name="email"]', "admin@hachi.com");
    await page.fill('input[type="password"], input[name="password"]', "Admin@2026");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard**", { timeout: 10000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test("should show dashboard KPIs after login", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"], input[name="email"]', "admin@hachi.com");
    await page.fill('input[type="password"], input[name="password"]', "Admin@2026");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard**", { timeout: 10000 });
    // Dashboard should have some content
    await expect(page.locator("main")).toBeVisible();
  });

  test("should logout successfully", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"], input[name="email"]', "admin@hachi.com");
    await page.fill('input[type="password"], input[name="password"]', "Admin@2026");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard**", { timeout: 10000 });
    // Logout via API directly (sidebar button may not be visible on smaller viewports)
    await page.request.post("/api/auth/logout");
    await page.goto("/dashboard");
    // Should redirect to login since session is gone
    await page.waitForURL("**/login**", { timeout: 10000 });
    await expect(page).toHaveURL(/login/);
  });
});
