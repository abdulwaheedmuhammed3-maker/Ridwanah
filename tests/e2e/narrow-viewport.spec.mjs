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

test("all public routes fit a narrow 320px mobile viewport", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Run the narrow viewport check once in the default Chromium project.");

  await page.setViewportSize({ width: 320, height: 800 });

  for (const route of publicRoutes) {
    const response = await page.goto(route);
    expect(response?.ok(), `Expected ${route} to load at 320px`).toBeTruthy();

    const layout = await page.evaluate(() => {
      const viewport = document.documentElement.clientWidth;
      const documentWidth = document.documentElement.scrollWidth;
      const viewportMeta = document.querySelector('meta[name="viewport"]')?.getAttribute("content") ?? "";

      return { viewport, documentWidth, viewportMeta };
    });

    expect(layout.viewport, `Unexpected layout viewport on ${route}`).toBe(320);
    expect(layout.viewportMeta, `Missing device-width viewport metadata on ${route}`).toMatch(/width=device-width/i);
    expect(
      layout.documentWidth,
      `Horizontal overflow on ${route} at 320px: document ${layout.documentWidth}px, viewport ${layout.viewport}px`
    ).toBeLessThanOrEqual(layout.viewport);
  }
});
