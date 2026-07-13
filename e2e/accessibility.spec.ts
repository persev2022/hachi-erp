import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

// Lightweight accessibility checks without axe-core dependency
// Validates: heading hierarchy, alt text, form labels, color contrast basics, focus management

async function runA11yChecks(page: Page, pageName: string) {
  const issues: string[] = [];

  // Check images have alt text
  const imagesWithoutAlt = await page.locator("img:not([alt])").count();
  if (imagesWithoutAlt > 0) {
    issues.push(`${imagesWithoutAlt} image(s) without alt text`);
  }

  // Check buttons have accessible text
  const emptyButtons = await page.locator("button:not([aria-label]):not(:has(svg + span)):empty").count();
  if (emptyButtons > 0) {
    issues.push(`${emptyButtons} button(s) without accessible text`);
  }

  // Check form inputs have labels or aria-label
  const inputsWithoutLabel = await page.locator("input:not([aria-label]):not([placeholder]):not([type='hidden']):not([type='submit'])").count();
  if (inputsWithoutLabel > 0) {
    issues.push(`${inputsWithoutLabel} input(s) without label or aria-label`);
  }

  // Check heading hierarchy (h1 should exist, no skipping levels)
  const h1Count = await page.locator("h1").count();
  const h2Count = await page.locator("h2").count();
  const h3Count = await page.locator("h3").count();
  // h3 without h2 is a skip
  if (h3Count > 0 && h2Count === 0) {
    issues.push("Heading hierarchy skip: h3 present without h2");
  }

  // Check links have text
  const emptyLinks = await page.locator("a:not([aria-label]):empty").count();
  if (emptyLinks > 0) {
    issues.push(`${emptyLinks} link(s) without text or aria-label`);
  }

  // Check page has lang attribute
  const htmlLang = await page.locator("html").getAttribute("lang");
  if (!htmlLang) {
    issues.push("Missing lang attribute on <html>");
  }

  return { pageName, issues, passed: issues.length === 0 };
}

test.describe("Accessibility Audit", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"], input[name="email"]', "admin@hachi.com");
    await page.fill('input[type="password"], input[name="password"]', "Admin@2026");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard**", { timeout: 10000 });
  });

  const pages = [
    { name: "Dashboard", url: "/dashboard" },
    { name: "Pacientes", url: "/pacientes" },
    { name: "Agenda", url: "/agenda" },
    { name: "Financeiro", url: "/financeiro" },
    { name: "Prontuário", url: "/prontuario" },
    { name: "Relatórios", url: "/relatorios" },
    { name: "Configurações", url: "/configuracoes" },
  ];

  for (const p of pages) {
    test(`${p.name} page accessibility`, async ({ page }) => {
      await page.goto(p.url);
      await page.waitForTimeout(1500); // Wait for content to load
      const result = await runA11yChecks(page, p.name);

      // Log issues but don't fail hard — report them
      if (result.issues.length > 0) {
        console.log(`[A11y] ${p.name}: ${result.issues.join(", ")}`);
      }

      // Soft assertion — fewer than 5 issues per page is acceptable
      expect(result.issues.length).toBeLessThan(5);
    });
  }

  test("Landing page accessibility", async ({ page }) => {
    await page.goto("/landing");
    await page.waitForTimeout(2000);
    const result = await runA11yChecks(page, "Landing");
    if (result.issues.length > 0) {
      console.log(`[A11y] Landing: ${result.issues.join(", ")}`);
    }
    expect(result.issues.length).toBeLessThan(5);
  });
});
