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
if (!await exists(path.join(dist, "404.html"))) missingRoutes.push("special 404 page");
if (!await exists(path.join(dist, "robots.txt"))) missingRoutes.push("robots.txt");
const robotsPath = path.join(dist, "robots.txt");
if (await exists(robotsPath)) {
  const robotsContent = await readFile(robotsPath, "utf8");
  if (!/^User-agent:\s*\*\s*$/mi.test(robotsContent)) {
    missingRoutes.push("robots.txt missing a global User-agent: * rule");
  }
  if (!/^Allow:\s*\/\s*$/mi.test(robotsContent)) {
    missingRoutes.push("robots.txt missing an Allow: / crawl directive");
  }
  if (/^Disallow:\s*\/\s*$/mi.test(robotsContent)) {
    missingRoutes.push("robots.txt blocks crawling of the entire site");
  }
}


const htmlFiles = await collectHtml(dist);
const htmlContentByPath = new Map();
for (const filePath of htmlFiles) htmlContentByPath.set(filePath, await readFile(filePath, "utf8"));
const brokenLinks = [];
const metadataProblems = [];
const placeholderPages = [];
const accessibilityProblems = [];
let pendingReviewArticleCount = 0;
const metadataValues = { titles: new Map(), descriptions: new Map() };

// Broad length bounds catch unusually short or long search metadata without
// treating pixel-width estimates as exact ranking or display requirements.
function metadataCharacterCount(value) {
  return value.replace(/&(?:amp|lt|gt|quot|apos|#\d+|#x[\da-f]+);/gi, "x").length;
}

for (const htmlFile of htmlFiles) {
  const html = htmlContentByPath.get(htmlFile) ?? "";
  const relative = path.relative(dist, htmlFile);
  const idOccurrences = new Map();
  for (const match of html.matchAll(/\bid=([^"]+)"/gi)) {
    const id = match[1];
    const firstLocation = idOccurrences.get(id);
    if (firstLocation) accessibilityProblems.push(relative + ": duplicate id=\"" + id + "\" (first occurrence at " + firstLocation + ")");
    else idOccurrences.set(id, match.index);
  }
  const normalizedRelative = relative.split(path.sep).join("/");

  // Audit every generated health article page so new guides cannot silently
  // lose the noindex protection while qualified medical review is pending.
  if (/^health\/[^/]+\/index\.html$/i.test(normalizedRelative)) {
    pendingReviewArticleCount += 1;
    if (!/<meta\s+name="robots"\s+content="noindex, follow"/i.test(html)) {
      missingRoutes.push("Pending-review article missing noindex robots directive: " + normalizedRelative);
    }
  }

  if (!/<title>[^<]+<\/title>/i.test(html)) metadataProblems.push(relative + ": missing title");
  if (!/<meta\s+name="description"\s+content="[^"]+"/i.test(html)) metadataProblems.push(relative + ": missing meta description");
  if (!/<meta\s+property="og:title"/i.test(html)) metadataProblems.push(relative + ": missing Open Graph title");
  if (!/<meta\s+property="og:description"\s+content="[^"]+"/i.test(html)) metadataProblems.push(relative + ": missing Open Graph description");
  if (!/<meta\s+name="twitter:card"\s+content="(?:summary|summary_large_image)"/i.test(html)) metadataProblems.push(relative + ": missing or invalid Twitter card type");
  if (!/<meta\s+name="twitter:title"\s+content="[^"]+"/i.test(html)) metadataProblems.push(relative + ": missing Twitter title");
  if (!/<meta\s+name="twitter:description"\s+content="[^"]+"/i.test(html)) metadataProblems.push(relative + ": missing Twitter description");

  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) {
    const titleValue = titleMatch[1].trim();
    const titleLength = metadataCharacterCount(titleValue);
    if (titleLength < 10 || titleLength > 70) {
      metadataProblems.push(relative + ": title length outside broad 10–70 character bounds (" + titleLength + ")");
    }
    const existingTitle = metadataValues.titles.get(titleValue);
    if (existingTitle) metadataProblems.push(relative + ": duplicate title shared with " + existingTitle);
    else metadataValues.titles.set(titleValue, relative);
  }
  const descriptionMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  if (descriptionMatch) {
    const descriptionValue = descriptionMatch[1].trim();
    const descriptionLength = metadataCharacterCount(descriptionValue);
    if (descriptionLength < 40 || descriptionLength > 180) {
      metadataProblems.push(relative + ": meta description length outside broad 40–180 character bounds (" + descriptionLength + ")");
    }
    const existingDescription = metadataValues.descriptions.get(descriptionValue);
    if (existingDescription) metadataProblems.push(relative + ": duplicate meta description shared with " + existingDescription);
    else metadataValues.descriptions.set(descriptionValue, relative);
  }

  if (/COMING SOON|IN DEVELOPMENT/i.test(html)) placeholderPages.push(relative);

  if (!/<html[^>]+lang="en"/i.test(html)) accessibilityProblems.push(relative + ": missing document language");
  if (!/<main\b/i.test(html)) accessibilityProblems.push(relative + ": missing main landmark");
  if (!/<a\b[^>]*class="skip-link"/i.test(html)) accessibilityProblems.push(relative + ": missing skip link");
  const pageIds = new Set([...html.matchAll(/\\bid="([^"]+)"/gi)].map((match) => match[1]));
  for (const nav of html.matchAll(/<nav\\b[^>]*>/gi)) {
    const navTag = nav[0];
    const ariaLabel = navTag.match(/\\baria-label\\s*=\\s*["']([^"']*)["']/i)?.[1]?.trim() ?? "";
    const labelledBy = navTag.match(/\\baria-labelledby\\s*=\\s*["']([^"']*)["']/i)?.[1]?.trim() ?? "";
    const labelledByIds = labelledBy ? labelledBy.split(/\\s+/) : [];
    if (!ariaLabel && (!labelledByIds.length || labelledByIds.some((id) => !pageIds.has(id)))) {
      accessibilityProblems.push(relative + ": navigation landmark without an accessible name");
    }
  }
  const h1Count = [...html.matchAll(/<h1\b/gi)].length;
  if (h1Count !== 1) accessibilityProblems.push(relative + ": expected one primary h1, found " + h1Count);
  for (const image of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt="/i.test(image[0])) accessibilityProblems.push(relative + ": image without alt text");
  }
  for (const time of html.matchAll(/<time\b[^>]*>/gi)) {
    const dateTime = time[0].match(/\bdatetime="([^"]+)"/i)?.[1];
    if (!dateTime || !/^\d{4}-\d{2}-\d{2}$/.test(dateTime) || !Number.isFinite(Date.parse(dateTime)) || new Date(dateTime).toISOString().slice(0, 10) !== dateTime) {
      accessibilityProblems.push(relative + ": time element missing a valid ISO date datetime attribute");
    }
  }
  for (const frame of html.matchAll(/<iframe\b[^>]*>/gi)) {
    if (!/\btitle="/i.test(frame[0])) accessibilityProblems.push(relative + ": iframe without title");
  }
  for (const anchor of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/gi)) {
    if (!/\brel="[^"]*noopener/i.test(anchor[0])) accessibilityProblems.push(relative + ": external new-tab link missing noopener");
    if (!/\brel="[^"]*noreferrer/i.test(anchor[0])) accessibilityProblems.push(relative + ": external new-tab link missing noreferrer");
  }

  for (const match of html.matchAll(/\bhref="([^"]+)"/g)) {
    const href = match[1];
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    let parsed;
    try { parsed = new URL(href, "https://ridwanah.invalid"); }
    catch { continue; }
    const pathname = parsed.pathname;
    let resolved;
    if (!pathname || pathname === "/") resolved = path.join(dist, "index.html");
    else {
      const direct = path.join(dist, pathname.replace(/^\//, ""));
      resolved = /\.[a-z0-9]{2,6}$/i.test(pathname) ? direct : path.join(direct, "index.html");
    }
    if (!await exists(resolved)) {
      brokenLinks.push(relative + " -> " + href);
      continue;
    }
    if (parsed.hash) {
      const targetHtml = htmlContentByPath.get(resolved) ?? await readFile(resolved, "utf8");
      const identifiers = new Set([...targetHtml.matchAll(/\bid="([^"]+)"/gi)].map((item) => item[1]));
      for (const namedAnchor of targetHtml.matchAll(/<a\b[^>]*\bname="([^"]+)"/gi)) identifiers.add(namedAnchor[1]);
      let fragment;
      try { fragment = decodeURIComponent(parsed.hash.slice(1)); }
      catch { fragment = parsed.hash.slice(1); }
      if (fragment && !identifiers.has(fragment)) brokenLinks.push(relative + " -> " + href + " (missing fragment target: " + fragment + ")");
    }
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
  console.log(`Checked ${requiredRoutes.length} required routes, ${pendingReviewArticleCount} health article pages for noindex protection, ${htmlFiles.length} HTML pages, internal links, metadata and accessibility basics.`);
}
