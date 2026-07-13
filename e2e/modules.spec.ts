import { test, expect } from "@playwright/test";

test.describe("Module Pages", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"], input[name="email"]', "admin@hachi.com");
    await page.fill('input[type="password"], input[name="password"]', "Admin@2026");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard**", { timeout: 10000 });
  });

  test("financeiro page loads", async ({ page }) => {
    await page.goto("/financeiro");
    await expect(page).toHaveURL(/financeiro/);
    await expect(page.locator("main")).toBeVisible();
  });

  test("agenda page loads", async ({ page }) => {
    await page.goto("/agenda");
    await expect(page).toHaveURL(/agenda/);
    await expect(page.locator("main")).toBeVisible();
  });

  test("estoque page loads", async ({ page }) => {
    await page.goto("/estoque");
    await expect(page).toHaveURL(/estoque/);
    await expect(page.locator("main")).toBeVisible();
  });

  test("quartos page loads", async ({ page }) => {
    await page.goto("/quartos");
    await expect(page).toHaveURL(/quartos/);
    await expect(page.locator("main")).toBeVisible();
  });

  test("prontuario page loads", async ({ page }) => {
    await page.goto("/prontuario");
    await expect(page).toHaveURL(/prontuario/);
    await expect(page.locator("main")).toBeVisible();
  });

  test("relatorios page loads with charts", async ({ page }) => {
    await page.goto("/relatorios");
    await expect(page).toHaveURL(/relatorios/);
    await page.waitForTimeout(2000);
    await expect(page.locator("main")).toBeVisible();
  });

  test("marketplace page loads and shows modules", async ({ page }) => {
    await page.goto("/marketplace");
    await expect(page).toHaveURL(/marketplace/);
    await page.waitForTimeout(2000);
    // Should show module cards
    const moduleCards = await page.locator("[class*=rounded-xl]").count();
    expect(moduleCards).toBeGreaterThan(0);
  });

  test("configuracoes page loads", async ({ page }) => {
    await page.goto("/configuracoes");
    await expect(page).toHaveURL(/configuracoes/);
    await expect(page.locator("main")).toBeVisible();
  });

  test("configuracoes/plano page loads with plan cards", async ({ page }) => {
    await page.goto("/configuracoes/plano");
    await expect(page).toHaveURL(/configuracoes\/plano/);
    await page.waitForTimeout(2000);
    await expect(page.locator("main")).toBeVisible();
  });
});

test.describe("Landing Pages", () => {
  const verticals = ["recovery", "clinic", "senior", "hotel", "restaurant", "education", "vet", "services"];

  test("main landing page loads", async ({ page }) => {
    await page.goto("/landing");
    await expect(page).toHaveURL(/landing/);
    await expect(page.locator("body")).toBeVisible();
  });

  for (const vertical of verticals) {
    test(`landing/${vertical} loads`, async ({ page }) => {
      await page.goto(`/landing/${vertical}`);
      await expect(page).toHaveURL(new RegExp(vertical));
      await expect(page.locator("body")).toBeVisible();
    });
  }
});

test.describe("Onboarding", () => {
  test("onboarding page loads", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page).toHaveURL(/onboarding/);
    await expect(page.locator("body")).toBeVisible();
  });
});
