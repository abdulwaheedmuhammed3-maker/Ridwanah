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

test("every public route has exactly one visible, non-empty H1", async ({ page }) => {
  for (const route of publicRoutes) {
    const response = await page.goto(route);
    expect(response?.ok(), `Expected ${route} to load`).toBeTruthy();

    const headings = await page.locator("h1:visible").evaluateAll((elements) =>
      elements.map((element) => element.textContent?.replace(/\\s+/g, " ").trim() ?? "")
    );

    expect(headings, `Expected one visible H1 on ${route}; found: ${JSON.stringify(headings)}`).toHaveLength(1);
    expect(headings[0], `Expected non-empty H1 on ${route}`).toBeTruthy();
  }
});
