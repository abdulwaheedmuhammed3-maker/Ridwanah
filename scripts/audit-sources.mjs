import { readFile } from "node:fs/promises";

const files = {
  articles: await readFile(new URL("../src/data/articles.ts", import.meta.url), "utf8"),
  news: await readFile(new URL("../src/data/news.ts", import.meta.url), "utf8")
};
const problems = [];
const urlPattern = /^https?:\/\/[\w.-]+(?:\/[^\s]*)?$/i;

function validateSourceBlock(block, label) {
  const title = block.match(/(?:title|sourceTitle):\s*"([^"]*)"/);
  const organisation = block.match(/(?:organisation|sourceName):\s*"([^"]*)"/);
  const url = block.match(/(?:url|sourceUrl):\s*"([^"]*)"/);
  const date = block.match(/sourceDate:\s*"([^"]*)"/);
  if (!title?.[1]?.trim()) problems.push(label + ": missing source title");
  if (!organisation?.[1]?.trim()) problems.push(label + ": missing source organisation");
  if (!date?.[1]?.trim()) problems.push(label + ": missing source date");
  else if (!/^\d{1,2} [A-Za-z]+ \d{4}$/.test(date[1].trim())) problems.push(label + ": source date should use 'DD Month YYYY' format");
  if (!url?.[1]?.trim()) problems.push(label + ": missing source URL");
  else if (!urlPattern.test(url[1])) problems.push(label + ": malformed or non-HTTP(S) URL: " + url[1]);
  return url?.[1] ?? "";
}

const articleSegments = files.articles.split(/\n\s*slug:\s*"/).slice(1);
for (const segment of articleSegments) {
  const slug = segment.split('"')[0];
  const sourcesMatch = segment.match(/sources:\s*\[([\s\S]*?)\n\s*\]/);
  if (!sourcesMatch) { problems.push("Article " + slug + ": missing sources array"); continue; }
  const sourceBlocks = [...sourcesMatch[1].matchAll(/\{([\s\S]*?)\}/g)].map(m => m[1]);
  if (!sourceBlocks.length) { problems.push("Article " + slug + ": empty sources array"); continue; }
  const seen = new Set();
  sourceBlocks.forEach((block, i) => {
    const url = validateSourceBlock(block, "Article " + slug + " source " + (i + 1));
    if (url && seen.has(url)) problems.push("Article " + slug + ": duplicate source URL " + url);
    if (url) seen.add(url);
  });
}

const newsSegments = files.news.split(/\n\s*slug:\s*"/).slice(1);
for (const segment of newsSegments) {
  const slug = segment.split('"')[0];
  const sourceFields = segment.match(/sourceName:\s*"[^"]*"\s*,[\s\S]*?sourceUrl:\s*"[^"]*"/);
  if (!sourceFields) { problems.push("News " + slug + ": missing source metadata"); continue; }
  validateSourceBlock(sourceFields[0], "News " + slug);
  const url = sourceFields[0].match(/sourceUrl:\s*"([^"]*)"/)?.[1] ?? "";
  if (url && (segment.match(/sourceUrl:\s*"([^"]*)"/g) ?? []).length > 1) problems.push("News " + slug + ": multiple sourceUrl fields");
}

if (problems.length) {
  console.error("Ridwanah source-integrity audit failed:");
  problems.forEach(p => console.error("- " + p));
  process.exitCode = 1;
} else {
  console.log("Ridwanah source-integrity audit passed.");
  console.log("Checked " + articleSegments.length + " health articles and " + newsSegments.length + " news items for source metadata, URL format and duplicate article citations.");
}
