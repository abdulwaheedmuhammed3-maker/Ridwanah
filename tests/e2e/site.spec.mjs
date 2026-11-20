import { test, expect } from "@playwright/test";

const publicRoutes = [
  "/",
  "/health/",
  "/health/handwashing-when-and-how/",
  "/health/physical-activity-for-adults/",
  "/health/healthy-eating-everyday-basics/",
  "/health/menstrual-health-understanding-your-cycle/",
  "/news/",
  "/watch/",
  "/prevention/",
  "/awareness/",
  "/about/",
  "/editorial-policy/",
  "/privacy/",
  "/disclaimer/",
  "/terms/"
];

test.beforeEach(async ({ page }) => {
  // The UI checks do not depend on the external video provider being reachable.
  await page.route("https://www.youtube-nocookie.com/**", (route) => route.abort());
});

test("all public routes render without horizontal page overflow", async ({ page }) => {
  for (const route of publicRoutes) {
    const response = await page.goto(route);
    expect(response?.ok(), `Expected ${route} to return a successful response`).toBeTruthy();

    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator(".skip-link")).toBeAttached();

    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth
    }));
    expect(
      dimensions.document,
      `Horizontal overflow on ${route}: document ${dimensions.document}px, viewport ${dimensions.viewport}px`
    ).toBeLessThanOrEqual(dimensions.viewport);
  }
});

test("navigation adapts to desktop, tablet and Android-sized viewports", async ({ page }, testInfo) => {
  await page.goto("/");

  const sidebar = page.locator(".sidebar");
  const mobileNavigation = page.locator(".mobile-bottom-nav");

  if (testInfo.project.name === "desktop-chromium") {
    await expect(sidebar).toBeVisible();
    await expect(mobileNavigation).toBeHidden();
  } else {
    await expect(sidebar).toBeHidden();
    await expect(mobileNavigation).toBeVisible();
    await expect(mobileNavigation.getByRole("link", { name: /Learn/ })).toBeVisible();
    await expect(mobileNavigation.getByRole("link", { name: /News/ })).toBeVisible();
    await expect(mobileNavigation.getByRole("link", { name: /Watch/ })).toBeVisible();
  }
});

test("health library category filter includes the wellbeing guide", async ({ page }) => {
  await page.goto("/health/");
  await page.getByRole("button", { name: "Wellbeing", exact: true }).click();
  await expect(page.locator("[data-article-card]:visible")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: /Menstrual health:/i })).toBeVisible();
});

test("health news region filter shows only Nigerian updates", async ({ page }) => {
  await page.goto("/news/");
  await page.getByRole("button", { name: "Nigeria", exact: true }).click();
  await expect(page.locator("[data-news-card]:visible")).toHaveCount(2);
  await expect(page.locator("#news-results-count")).toContainText("Showing 2 updates");
});

test("unknown routes use the custom not-found page", async ({ page }) => {
  const response = await page.goto("/route-that-does-not-exist/");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: /This page seems/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Back to homepage/i })).toBeVisible();
});
