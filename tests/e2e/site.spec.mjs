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

test("health library search filters guides and recovers from empty results", async ({ page }) => {
  await page.goto("/health/");
  const search = page.getByRole("searchbox", { name: "Search health articles" });

  await search.fill("menstrual health");
  await expect(page.locator("[data-article-card]:visible")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: /Menstrual health:/i })).toBeVisible();
  await expect(page.locator("#result-count")).toContainText("Showing 1 learning guide");

  await search.fill("ridwanah-no-matching-topic");
  await expect(page.locator("[data-article-card]:visible")).toHaveCount(0);
  await expect(page.locator("#library-empty")).toBeVisible();

  await page.getByRole("button", { name: "Clear search and filters" }).click();
  await expect(search).toHaveValue("");
  await expect(page.locator("[data-article-card]:visible")).toHaveCount(4);
});

test("health news search and empty-state recovery work", async ({ page }) => {
  await page.goto("/news/");
  const search = page.getByRole("searchbox", { name: "Search health news" });

  await search.fill("lead poisoning");
  await expect(page.locator("[data-news-card]:visible")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: /lead poisoning/i })).toBeVisible();

  await search.fill("ridwanah-no-matching-update");
  await expect(page.locator("[data-news-card]:visible")).toHaveCount(0);
  await expect(page.locator("#news-empty")).toBeVisible();

  await page.getByRole("button", { name: "Clear search and filters" }).click();
  await expect(search).toHaveValue("");
  await expect(page.locator("[data-news-card]:visible")).toHaveCount(5);
});

test("every health guide keeps its pending-review status and attributed HTTPS sources", async ({ page }) => {
  const articleRoutes = [
    "/health/handwashing-when-and-how/",
    "/health/physical-activity-for-adults/",
    "/health/healthy-eating-everyday-basics/",
    "/health/menstrual-health-understanding-your-cycle/"
  ];

  for (const route of articleRoutes) {
    await page.goto(route);
    await expect(page.locator(".article-review-banner")).toContainText("Educational draft — medical review pending");

    const sources = page.locator(".article-sources ol a");
    expect(await sources.count(), `Expected attributed sources on ${route}`).toBeGreaterThan(0);
    const sourceLinks = await sources.evaluateAll((anchors) =>
      anchors.map((anchor) => ({
        href: anchor.getAttribute("href") ?? "",
        target: anchor.getAttribute("target"),
        rel: anchor.getAttribute("rel") ?? ""
      }))
    );
    for (const link of sourceLinks) {
      expect(link.href, `Invalid source URL on ${route}`).toMatch(/^https:\/\//);
      expect(link.target).toBe("_blank");
      expect(link.rel).toContain("noopener");
    }
  }
});

test("video library category filtering shows the matching video", async ({ page }) => {
  await page.goto("/watch/");
  await page.getByRole("button", { name: "Infection prevention", exact: true }).click();
  await expect(page.locator("[data-video-card]:visible")).toHaveCount(1);
  await expect(page.locator("[data-video-card]:visible h2")).toContainText("sharing hand-hygiene knowledge");

  await page.getByRole("button", { name: "All videos", exact: true }).click();
  await expect(page.locator("[data-video-card]:visible")).toHaveCount(2);
});

test("every curated news brief and video exposes a secure original-source link", async ({ page }) => {
  await page.goto("/news/");
  const newsLinks = page.locator(".news-source a");
  await expect(newsLinks).toHaveCount(5);
  const newsDestinations = await newsLinks.evaluateAll((anchors) =>
    anchors.map((anchor) => ({
      href: anchor.getAttribute("href") ?? "",
      target: anchor.getAttribute("target"),
      rel: anchor.getAttribute("rel") ?? ""
    }))
  );
  for (const link of newsDestinations) {
    expect(link.href).toMatch(/^https:\/\//);
    expect(link.target).toBe("_blank");
    expect(link.rel).toContain("noopener");
  }

  await page.goto("/watch/");
  const videoLinks = page.locator(".video-card-footer a");
  await expect(videoLinks).toHaveCount(2);
  const videoDestinations = await videoLinks.evaluateAll((anchors) =>
    anchors.map((anchor) => ({
      href: anchor.getAttribute("href") ?? "",
      target: anchor.getAttribute("target"),
      rel: anchor.getAttribute("rel") ?? ""
    }))
  );
  for (const link of videoDestinations) {
    expect(link.href).toMatch(/^https:\/\//);
    expect(link.target).toBe("_blank");
    expect(link.rel).toContain("noopener");
  }
});


test("keyboard users can reveal skip link and reach primary navigation", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skipLink = page.locator(".skip-link");
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
  await expect(page.locator("main")).toBeVisible();

  // Confirm the navigation controls for the active responsive layout remain keyboard-focusable.
  const desktopNav = page.locator(".sidebar-nav a").first();
  const mobileNav = page.locator(".mobile-bottom-nav a").first();
  const firstNavLink = await desktopNav.isVisible() ? desktopNav : mobileNav;
  await expect(firstNavLink).toBeVisible();
  await firstNavLink.focus();
  await expect(firstNavLink).toBeFocused();
});

test("health library filter controls expose keyboard focus and activate", async ({ page }) => {
  await page.goto("/health/");
  const wellbeingFilter = page.getByRole("button", { name: "Wellbeing", exact: true });
  await wellbeingFilter.focus();
  await expect(wellbeingFilter).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-article-card]:visible")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: /Menstrual health:/i })).toBeVisible();
});
