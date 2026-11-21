import { test, expect } from "@playwright/test";

const publicRoutes = [
  "/",
  "/health/",
  "/health/handwashing-when-and-how/",
  "/health/physical-activity-for-adults/",
  "/health/healthy-eating-everyday-basics/",
  "/health/menstrual-health-understanding-your-cycle/",
  "/discover/",
  "/play/",
  "/ask/",
  "/my-health/",
  "/alert/",
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
    await expect(mobileNavigation.getByRole("link", { name: /Discover/ })).toBeVisible();
    await expect(mobileNavigation.getByRole("link", { name: /Play/ })).toBeVisible();
    await expect(mobileNavigation.getByRole("link", { name: /Ask/ })).toBeVisible();
    await expect(mobileNavigation.getByRole("link", { name: /My Health/ })).toBeVisible();
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

test("health news publication dates use valid machine-readable ISO dates", async ({ page }) => {
  await page.goto("/news/");
  const dates = page.locator("[data-news-card] time");
  await expect(dates).toHaveCount(5);
  const values = await dates.evaluateAll((nodes) => nodes.map((node) => ({
    datetime: node.getAttribute("datetime"),
    text: node.textContent?.trim() ?? ""
  })));
  for (const value of values) {
    expect(value.datetime).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Number.isFinite(Date.parse(value.datetime ?? ""))).toBe(true);
    expect(new Date(value.datetime ?? "").toISOString().slice(0, 10)).toBe(value.datetime);
    expect(new Date(value.text).toISOString().slice(0, 10)).toBe(value.datetime);
  }
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

test("every guide linked from the health library shows review status and attributed sources", async ({ page }) => {
  await page.goto("/health/");
  const guideLinks = await page.locator("[data-article-card] h2 a").evaluateAll((links) =>
    links.map((link) => link.getAttribute("href")).filter((href) => href && href.startsWith("/health/"))
  );
  expect(guideLinks.length, "Expected health library to list at least one guide").toBeGreaterThan(0);

  for (const route of guideLinks) {
    await page.goto(route);
    await expect(page.locator(".article-review-banner")).toContainText("Educational draft — medical review pending");
    const sourceLinks = page.locator(".article-sources ol a");
    expect(await sourceLinks.count(), `Expected attributed sources on ${route}`).toBeGreaterThan(0);
    const destinations = await sourceLinks.evaluateAll((anchors) =>
      anchors.map((anchor) => ({
        href: anchor.getAttribute("href") ?? "",
        target: anchor.getAttribute("target"),
        rel: anchor.getAttribute("rel") ?? ""
      }))
    );
    for (const link of destinations) {
      expect(link.href, `Invalid source URL on ${route}`).toMatch(/^https:\/\//);
      expect(link.target).toBe("_blank");
      expect(link.rel).toContain("noopener");
    }
  }
});

test("health news region filters are keyboard-operable and expose selection state", async ({ page }) => {
  await page.goto("/news/");
  const allCardsCount = await page.locator("[data-news-card]").count();
  const nigeriaFilter = page.getByRole("button", { name: "Nigeria", exact: true });
  await nigeriaFilter.focus();
  await expect(nigeriaFilter).toBeFocused();
  await page.keyboard.press("Space");
  await expect(nigeriaFilter).toHaveAttribute("aria-pressed", "true");

  const visibleCards = page.locator("[data-news-card]:visible");
  expect(await visibleCards.count()).toBeGreaterThan(0);
  const visibleRegions = await visibleCards.evaluateAll((cards) =>
    cards.map((card) => card.getAttribute("data-region"))
  );
  expect(visibleRegions.every((region) => region === "nigeria")).toBe(true);

  const allFilter = page.getByRole("button", { name: "All updates", exact: true });
  await allFilter.focus();
  await expect(allFilter).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(allFilter).toHaveAttribute("aria-pressed", "true");
  await expect(nigeriaFilter).toHaveAttribute("aria-pressed", "false");
  await expect(visibleCards).toHaveCount(allCardsCount);
});


test("health library search results count is announced to assistive technology", async ({ page }) => {
  await page.goto("/health/");
  const resultCount = page.locator("#result-count");
  await expect(resultCount).toHaveAttribute("aria-live", "polite");
  await expect(resultCount).toHaveAttribute("aria-atomic", "true");
  await page.getByRole("searchbox", { name: "Search health articles" }).fill("menstrual health");
  await expect(resultCount).toContainText("Showing 1 learning guide");
  await page.getByRole("searchbox", { name: "Search health articles" }).fill("ridwanah-no-matching-topic");
  await expect(resultCount).toContainText("Showing 0 learning guides");
});

test("health news search and region filters compose and clear restores the library", async ({ page }) => {
  await page.goto("/news/");
  const search = page.getByRole("searchbox", { name: "Search health news" });
  const nigeriaFilter = page.getByRole("button", { name: "Nigeria", exact: true });
  const allFilter = page.getByRole("button", { name: "All updates", exact: true });
  const visibleCards = page.locator("[data-news-card]:visible");
  const resultCount = page.locator("#news-results-count");

  await search.fill("lead poisoning");
  await expect(visibleCards).toHaveCount(1);
  await expect(resultCount).toContainText("Showing 1 update");

  await nigeriaFilter.click();
  await expect(nigeriaFilter).toHaveAttribute("aria-pressed", "true");
  await expect(visibleCards).toHaveCount(1);

  await search.fill("ridwanah-no-matching-update");
  await expect(visibleCards).toHaveCount(0);
  await expect(page.locator("#news-empty")).toBeVisible();

  await page.getByRole("button", { name: "Clear search and filters" }).click();
  await expect(search).toHaveValue("");
  await expect(search).toBeFocused();
  await expect(allFilter).toHaveAttribute("aria-pressed", "true");
  await expect(nigeriaFilter).toHaveAttribute("aria-pressed", "false");
  await expect(visibleCards).toHaveCount(5);
  await expect(resultCount).toContainText("Showing 5 updates");
});

test("health library and news search fields show a visible focus indicator", async ({ page }) => {
  await page.goto("/health/");
  const librarySearch = page.getByRole("searchbox", { name: "Search health articles" });
  const libraryWrap = page.locator(".library-search-wrap");
  await librarySearch.focus();
  await expect(libraryWrap).toHaveCSS("outline-width", "3px");
  await expect(libraryWrap).toHaveCSS("outline-style", "solid");
  await expect(libraryWrap).toHaveCSS("outline-offset", "3px");

  await page.goto("/news/");
  const newsSearch = page.getByRole("searchbox", { name: "Search health news" });
  const newsWrap = page.locator(".news-search-wrap");
  await newsSearch.focus();
  await expect(newsWrap).toHaveCSS("outline-width", "3px");
  await expect(newsWrap).toHaveCSS("outline-style", "solid");
  await expect(newsWrap).toHaveCSS("outline-offset", "3px");
});

test("current page is identified semantically in primary navigation", async ({ page }, testInfo) => {
  const cases = [
    { route: "/health/", desktop: "/health", mobile: "/health" },
    { route: "/news/", desktop: "/news", mobile: "/news" },
    { route: "/watch/", desktop: "/watch", mobile: "/watch" },
    { route: "/about/", desktop: "/about", mobile: "/about" },
    { route: "/prevention/", desktop: "/prevention" },
    { route: "/awareness/", desktop: "/awareness" },
    { route: "/editorial-policy/", desktop: "/editorial-policy" }
  ];

  for (const item of cases) {
    await page.goto(item.route);
    const desktopCurrent = page.locator(`.sidebar-nav a[href="${item.desktop}"]`);
    await expect(desktopCurrent).toHaveAttribute("aria-current", "page");
    await expect(desktopCurrent).toHaveClass(/active/);

    if (item.mobile && testInfo.project.name !== "desktop-chromium") {
      const mobileCurrent = page.locator(`.mobile-bottom-nav a[href="${item.mobile}"]`);
      await expect(mobileCurrent).toHaveAttribute("aria-current", "page");
      await expect(mobileCurrent).toHaveClass(/selected/);
    } else if (item.mobile) {
      // The mobile navigation remains in the DOM at desktop sizes; verify its page semantics too.
      const mobileCurrent = page.locator(`.mobile-bottom-nav a[href="${item.mobile}"]`);
      await expect(mobileCurrent).toHaveAttribute("aria-current", "page");
      await expect(mobileCurrent).toHaveClass(/selected/);
    }
  }
});


test("every public route has accessible names for links", async ({ page }) => {
  for (const route of publicRoutes) {
    await page.goto(route);
    const unnamedLinks = await page.locator("a[href]").evaluateAll((anchors) => anchors.map((anchor) => {
      const ariaLabel = anchor.getAttribute("aria-label")?.trim() ?? "";
      const labelledBy = (anchor.getAttribute("aria-labelledby") ?? "").split(/\\s+/)
        .map((id) => document.getElementById(id)?.textContent?.trim() ?? "")
        .filter(Boolean).join(" ");
      const clone = anchor.cloneNode(true);
      clone.querySelectorAll('[aria-hidden="true"], [hidden]').forEach((element) => element.remove());
      const text = clone.textContent?.replace(/\\s+/g, " ").trim() ?? "";
      const imageAlt = Array.from(anchor.querySelectorAll("img")).map((image) => image.getAttribute("alt")?.trim() ?? "").filter(Boolean).join(" ");
      const svgTitle = Array.from(anchor.querySelectorAll("svg title")).map((title) => title.textContent?.trim() ?? "").filter(Boolean).join(" ");
      const title = anchor.getAttribute("title")?.trim() ?? "";
      const name = ariaLabel || labelledBy || text || imageAlt || svgTitle || title;
      return name ? null : { href: anchor.getAttribute("href"), markup: anchor.outerHTML.slice(0, 180) };
    }).filter(Boolean));
    expect(unnamedLinks, `Links without an accessible-name signal on ${route}: ${JSON.stringify(unnamedLinks)}`).toEqual([]);
  }
});


test("health library and video filters announce selected state and reset it", async ({ page }) => {
  await page.goto("/health/");
  const allTopics = page.getByRole("button", { name: "All topics", exact: true });
  const wellbeing = page.getByRole("button", { name: "Wellbeing", exact: true });
  await expect(allTopics).toHaveAttribute("aria-pressed", "true");
  await expect(wellbeing).toHaveAttribute("aria-pressed", "false");

  await wellbeing.click();
  await expect(wellbeing).toHaveAttribute("aria-pressed", "true");
  await expect(allTopics).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("[data-article-card]:visible")).toHaveCount(1);

  // Reset the topic selection directly; the empty-state clear button is only
  // rendered when no cards match, so it is not available for this filter.
  await allTopics.click();
  await expect(allTopics).toHaveAttribute("aria-pressed", "true");
  await expect(wellbeing).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("[data-article-card]:visible")).toHaveCount(4);

  await page.goto("/watch/");
  const allVideos = page.getByRole("button", { name: "All videos", exact: true });
  const infectionPrevention = page.getByRole("button", { name: "Infection prevention", exact: true });
  await expect(allVideos).toHaveAttribute("aria-pressed", "true");
  await expect(infectionPrevention).toHaveAttribute("aria-pressed", "false");

  await infectionPrevention.click();
  await expect(infectionPrevention).toHaveAttribute("aria-pressed", "true");
  await expect(allVideos).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("[data-video-card]:visible")).toHaveCount(1);

  // Reset by selecting the default filter; the empty-state button is only
  // present when a category yields zero videos.
  await allVideos.click();
  await expect(allVideos).toHaveAttribute("aria-pressed", "true");
  await expect(infectionPrevention).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("[data-video-card]:visible")).toHaveCount(2);
});


test("every public route has accessible names for button controls", async ({ page }) => {
  for (const route of publicRoutes) {
    await page.goto(route);
    const unnamedButtons = await page.locator("button, [role=button], input[type=button], input[type=submit], input[type=reset]").evaluateAll((controls) => controls.map((control) => {
      const ariaLabel = control.getAttribute("aria-label")?.trim() ?? "";
      const labelledBy = (control.getAttribute("aria-labelledby") ?? "").split(/\\s+/)
        .map((id) => document.getElementById(id)?.textContent?.trim() ?? "")
        .filter(Boolean).join(" ");
      const clone = control.cloneNode(true);
      clone.querySelectorAll('[aria-hidden="true"], [hidden]').forEach((element) => element.remove());
      const text = clone.textContent?.replace(/\\s+/g, " ").trim() ?? "";
      const imageAlt = Array.from(control.querySelectorAll("img")).map((image) => image.getAttribute("alt")?.trim() ?? "").filter(Boolean).join(" ");
      const svgTitle = Array.from(control.querySelectorAll("svg title")).map((title) => title.textContent?.trim() ?? "").filter(Boolean).join(" ");
      const title = control.getAttribute("title")?.trim() ?? "";
      const value = control.getAttribute("value")?.trim() ?? "";
      const name = ariaLabel || labelledBy || text || imageAlt || svgTitle || title || value;
      return name ? null : { tag: control.tagName, markup: control.outerHTML.slice(0, 180) };
    }).filter(Boolean));
    expect(unnamedButtons, `Controls without an accessible-name signal on ${route}: ${JSON.stringify(unnamedButtons)}`).toEqual([]);
  }
});


test("robots.txt permits public crawling without requiring an unconfigured sitemap", async ({ page }) => {
  const response = await page.request.get("/robots.txt");
  expect(response?.ok(), "Expected robots.txt to be served").toBeTruthy();
  const content = await response.text();
  expect(content).toMatch(/^User-agent:\s*\*\s*$/m);
  expect(content).toMatch(/^Allow:\s*\/\s*$/m);
  expect(content).not.toMatch(/^Disallow:\s*\/\s*$/m);
});


test("homepage navigation identifies the current page", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('.sidebar-nav a[href="/"]')).toHaveAttribute("aria-current", "page");
  await expect(page.locator('.mobile-bottom-nav a[href="/"]')).toHaveAttribute("aria-current", "page");
});


test("every public route has named navigation landmarks", async ({ page }) => {
  for (const route of publicRoutes) {
    await page.goto(route);
    const unnamedNavigation = await page.locator("nav").evaluateAll((navs) => navs.map((nav) => {
      const ariaLabel = nav.getAttribute("aria-label")?.trim() ?? "";
      const ids = (nav.getAttribute("aria-labelledby") ?? "").split(/\s+/).filter(Boolean);
      const labelledBy = ids.length && ids.every((id) => document.getElementById(id)?.textContent?.trim())
        ? ids.map((id) => document.getElementById(id)?.textContent?.trim() ?? "").join(" ")
        : "";
      const name = labelledBy || ariaLabel;
      return name ? null : { markup: nav.outerHTML.slice(0, 180) };
    }).filter(Boolean));
    expect(unnamedNavigation, `Navigation landmarks without accessible names on ${route}: ${JSON.stringify(unnamedNavigation)}`).toEqual([]);
  }
});


test("new discovery-first routes provide their intended entry points", async ({ page }) => {
  await page.goto("/discover/");
  await expect(page.getByRole("heading", { name: /Discover your next aha moment/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Public-health updates/i })).toBeVisible();

  await page.goto("/my-health/");
  await expect(page.getByRole("heading", { name: /Get to know yourself better/i })).toBeVisible();
  await expect(page.getByText(/Cycle dates, symptoms, moods and reminders are not being collected or saved/i)).toBeVisible();
  await expect(page.locator("input")).toHaveCount(0);
});

test("the Play quiz gives feedback and advances after an answer", async ({ page }) => {
  await page.goto("/play/");
  await page.getByRole("button", { name: /Check who published it and when/i }).click();
  await expect(page.locator("#quiz-feedback")).toContainText(/Nice/);
  await expect(page.locator("#quiz-next")).toBeVisible();
  await page.locator("#quiz-next").click();
  await expect(page.getByRole("heading", { name: /A health update includes a number/i })).toBeVisible();
});

test("Ask RIDWANAH searches current content without pretending to be AI", async ({ page }) => {
  await page.goto("/ask/");
  await expect(page.getByText(/AI conversation service is not connected yet/i)).toBeVisible();
  await page.getByRole("searchbox", { name: /What would you like to understand/i }).fill("menstrual");
  await expect(page.locator("[data-ask-result]:visible")).toHaveCount(1);
  await expect(page.locator("[data-ask-result]:visible")).toContainText(/Menstrual health/i);
});

test("RIDWANAH Alert labels curated updates and original sources", async ({ page }) => {
  await page.goto("/alert/");
  await expect(page.getByRole("heading", { name: /RIDWANAH Alert/i })).toBeVisible();
  await expect(page.getByText(/not real-time outbreak monitoring/i)).toBeVisible();
  await expect(page.locator(".rw-alert-card")).toHaveCount(5);
  await expect(page.locator(".rw-alert-card a[target=_blank]")).toHaveCount(5);
});