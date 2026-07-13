/**
 * Lighthouse CI Configuration
 *
 * Run with: npx @lhci/cli autorun
 * Install: npm install -D @lhci/cli
 *
 * Targets: Performance > 80, A11y > 90, Best Practices > 90, SEO > 90
 */
module.exports = {
  ci: {
    collect: {
      url: [
        "https://hachi-erp.vercel.app/landing",
        "https://hachi-erp.vercel.app/login",
        "https://hachi-erp.vercel.app/landing/recovery",
        "https://hachi-erp.vercel.app/landing/clinic",
      ],
      numberOfRuns: 3,
      settings: {
        preset: "desktop",
        throttling: {
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.8 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:seo": ["warn", { minScore: 0.9 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
