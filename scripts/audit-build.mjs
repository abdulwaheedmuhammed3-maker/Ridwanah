import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const dist = path.resolve(process.cwd(), "dist");
const requiredRoutes = [
  "/", "/health/", "/health/handwashing-when-and-how/",
  "/health/physical-activity-for-adults/",
  "/health/healthy-eating-everyday-basics/",
  "/health/menstrual-health-understanding-your-cycle/",
  "/news/", "/watch/", "/prevention/", "/awareness/",
  "/about/", "/editorial-policy/", "/privacy/", "/disclaimer/", "/terms/"
];
const pendingReviewRoutes = [
  "/health/handwashing-when-and-how/",
  "/health/physical-activity-for-adults/",
  "/health/healthy-eating-everyday-basics/",
  "/health/menstrual-health-understanding-your-cycle/"
];

function outputPathForRoute(route) {
  if (route === "/") return path.join(dist, "index.html");
  return path.join(dist, route.replace(/^\//, ""), "index.html");
}

async function exists(filePath) {
  try { await access(filePath); return true; } catch { return false; }
}

async function collectHtml(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...await collectHtml(fullPath));
    else if (entry.isFile() && entry.name.endsWith(".html")) found.push(fullPath);
  }
  return found;
}

const missingRoutes = [];
for (const route of requiredRoutes) {
  if (!await exists(outputPathForRoute(route))) missingRoutes.push(route);
}
for (const route of pendingReviewRoutes) {
  const html = await readFile(outputPathForRoute(route), "utf8").catch(() => "");
  if (!/<meta\s+name="robots"\s+content="noindex, follow"/i.test(html)) {
    missingRoutes.push("Pending-review article missing noindex robots directive: " + route);
  }
}
if (!await exists(path.join(dist, "404.html"))) missingRoutes.push("special 404 page");
if (!await exists(path.join(dist, "robots.txt"))) missingRoutes.push("robots.txt");

const htmlFiles = await collectHtml(dist);
const brokenLinks = [];
const metadataProblems = [];
const placeholderPages = [];
const accessibilityProblems = [];
const metadataValues = { titles: new Map(), descriptions: new Map() };

for (const htmlFile of htmlFiles) {
  const html = await readFile(htmlFile, "utf8");
  const relative = path.relative(dist, htmlFile);

  if (!/<title>[^<]+<\/title>/i.test(html)) metadataProblems.push(relative + ": missing title");
  if (!/<meta\s+name="description"\s+content="[^"]+"/i.test(html)) metadataProblems.push(relative + ": missing meta description");
  if (!/<meta\s+property="og:title"/i.test(html)) metadataProblems.push(relative + ": missing Open Graph title");

  if (/COMING SOON|IN DEVELOPMENT/i.test(html)) placeholderPages.push(relative);

  if (!/<html[^>]+lang="en"/i.test(html)) accessibilityProblems.push(relative + ": missing document language");
  if (!/<main\b/i.test(html)) accessibilityProblems.push(relative + ": missing main landmark");
  if (!/<a\b[^>]*class="skip-link"/i.test(html)) accessibilityProblems.push(relative + ": missing skip link");
  const h1Count = [...html.matchAll(/<h1\b/gi)].length;
  if (h1Count !== 1) accessibilityProblems.push(relative + ": expected one primary h1, found " + h1Count);
  for (const image of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt="/i.test(image[0])) accessibilityProblems.push(relative + ": image without alt text");
  }
  for (const frame of html.matchAll(/<iframe\b[^>]*>/gi)) {
    if (!/\btitle="/i.test(frame[0])) accessibilityProblems.push(relative + ": iframe without title");
  }
  for (const anchor of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/gi)) {
    if (!/\brel="[^"]*noopener/i.test(anchor[0])) accessibilityProblems.push(relative + ": external new-tab link missing noopener");
  }

  for (const match of html.matchAll(/\bhref="([^"]+)"/g)) {
    const href = match[1];
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    let pathname;
    try { pathname = new URL(href, "https://ridwanah.invalid").pathname; }
    catch { continue; }
    if (!pathname || pathname === "/") {
      if (!await exists(path.join(dist, "index.html"))) brokenLinks.push(relative + " -> " + href);
      continue;
    }
    const direct = path.join(dist, pathname.replace(/^\//, ""));
    const resolved = /\.[a-z0-9]{2,6}$/i.test(pathname) ? direct : path.join(direct, "index.html");
    if (!await exists(resolved)) brokenLinks.push(relative + " -> " + href);
  }
}

const errors = [
  ...missingRoutes.map((item) => "Missing output: " + item),
  ...brokenLinks.map((item) => "Broken internal link: " + item),
  ...metadataProblems,
  ...accessibilityProblems,
  ...placeholderPages.map((item) => "Unfinished placeholder content: " + item)
];

if (errors.length) {
  console.error("Ridwanah build audit failed:");
  for (const error of errors) console.error("- " + error);
  process.exitCode = 1;
} else {
  console.log("Ridwanah build audit passed.");
  console.log(`Checked ${requiredRoutes.length} routes, ${htmlFiles.length} HTML pages, internal links, metadata and accessibility basics.`);
}
