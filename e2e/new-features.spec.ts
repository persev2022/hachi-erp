import { test, expect } from "@playwright/test";

test.describe("New Vertical Features", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"], input[name="email"]', "admin@hachi.com");
    await page.fill('input[type="password"], input[name="password"]', "Admin@2026");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard**", { timeout: 10000 });
  });

  test("teleconsulta page loads and shows title", async ({ page }) => {
    await page.goto("/ferramentas/teleconsulta");
    await page.waitForTimeout(2000);
    await expect(page.locator("main")).toBeVisible();
  });

  test("channel manager page loads and shows channels", async ({ page }) => {
    await page.goto("/ferramentas/channels");
    await expect(page.locator("text=Channel Manager")).toBeVisible({ timeout: 5000 });
  });

  test("matricula page loads", async ({ page }) => {
    await page.goto("/ferramentas/matricula");
    await page.waitForTimeout(2000);
    await expect(page.locator("main")).toBeVisible();
  });

  test("diario de classe page loads", async ({ page }) => {
    await page.goto("/ferramentas/diario");
    await page.waitForTimeout(2000);
    await expect(page.locator("main")).toBeVisible();
  });

  test("teleconsulta API works", async ({ page }) => {
    const res = await page.request.get("/api/clinic/teleconsulta");
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  test("channel manager API works", async ({ page }) => {
    const res = await page.request.get("/api/hotel/channels");
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty("channels");
  });

  test("matricula API works", async ({ page }) => {
    const res = await page.request.get("/api/education/matricula");
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  test("diario API works", async ({ page }) => {
    const res = await page.request.get("/api/education/diario?turma=5A&data=2026-07-13");
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty("registros");
  });
});
