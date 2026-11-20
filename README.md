# Ridwanah

**Learn • Prevent • Live Healthier**

Ridwanah is a responsive digital health education website. Its purpose is to make reputable public-health information easier to find, understand and use in everyday conversations.

The current build is a static Astro website. It does not include accounts, a medical consultation service, a backend, a database or personal health-data collection.

## Current website

| Route | Purpose |
| --- | --- |
| `/` | Homepage and entry point |
| `/health` | Searchable health education library |
| `/health/handwashing-when-and-how` | Handwashing guide |
| `/health/physical-activity-for-adults` | Adult physical-activity guide |
| `/health/healthy-eating-everyday-basics` | Healthy eating guide |
| `/health/menstrual-health-understanding-your-cycle` | Menstrual health guide |
| `/news` | Curated, source-linked public-health news |
| `/watch` | Selected educational videos from WHO |
| `/prevention` | Prevention and healthy-living learning hub |
| `/awareness` | Public-health campaigns and observances |
| `/about` | About Ridwanah |
| `/editorial-policy` | Editorial and medical-review standards |
| `/privacy` | Privacy notice for the current static site |
| `/disclaimer` | Health information disclaimer |
| `/terms` | Website terms of use |


## Technology

- Astro + TypeScript
- Static pages and local TypeScript content data
- Lightweight CSS; no UI framework or runtime database
- YouTube privacy-enhanced embeds for selected videos
- GitHub repository and GitHub Actions validation
- Playwright browser smoke tests at desktop, tablet and Android-sized viewport dimensions

The website is designed to remain simple to build and host. No production hosting provider is configured in this repository yet.

## Run locally

Requirements: Node.js 22.23.4 or later.

```bash
npm install
npm run dev
```

Open the local address printed by Astro.

## Validate and build

Run the checks before committing:

```bash
npm run check
npm run build
npm run audit
npm run test:e2e
npm run preview
```

GitHub Actions runs `npm run check`, `npm run build`, `npm run audit` and Playwright browser tests on pushes to `main` and on pull requests targeting `main`. The browser suite emulates desktop, a 768px tablet viewport and a Pixel 7-sized Android viewport. Emulation is not a substitute for testing a physical device. The audit checks required output routes, internal links, page metadata, basic accessibility landmarks, image alternatives, iframe titles, external new-tab link safety and unfinished placeholder copy. Astro generates `404.astro` as the special `404.html` page used by static hosts; it is not a normal `/404` route.

## Content structure

- `src/data/articles.ts` — health education guide data.
- `src/data/news.ts` — curated source-linked public-health news.
- `src/data/videos.ts` — selected external learning videos.
- `src/pages/` — route pages.
- `src/layouts/` — shared page layouts.
- `src/styles/` — brand, homepage, library, news, shared content-page and accessibility/readability styles.
- `docs/content-review-workflow.md` — practical source, editorial and qualified medical review process.
- `docs/pre-launch-checklist.md` — content, legal, technical and deployment checklist.
- `public/brand/` — Ridwanah SVG brand assets.

### Adding a health guide

Add an entry to `src/data/articles.ts` with a unique slug, title, description, category, reading time, publication date, medical-review status, takeaways, sections and source references. The article route is generated from this data.

Editorial requirements:
- Prefer primary and reputable public-health sources.
- Keep claims within the scope of cited evidence and do not add unsupported treatment instructions.
- Include the exact source title, organisation, publication date and direct URL.
- Keep medical review pending until a suitably qualified professional has genuinely reviewed and approved the content.
- Never invent reviewer names, credentials, registration numbers, review dates or endorsements.
- Recheck links and guidance when updating content.
- Keep the education disclaimer visible.

### Adding a health news item

Add an entry to `src/data/news.ts` with a unique slug, a short original summary, region, topic, source organisation, source type, publication date, exact source title and direct URL.

- Clearly attribute announcements, estimates and targets to the organisation that published them.
- Use `contextDate` when an event date differs from the publication date.
- Do not present old outbreak figures as live alerts.
- Keep summaries brief and link to the original source instead of copying full articles.
- Recheck fast-changing information before featuring it.
- The current news archive is curated and static; it does not automatically update.

### Adding an educational video

Add a record to `src/data/videos.ts` with the publisher, title, source date, summary, category, canonical source URL and verified YouTube video ID. Confirm that the video is published by the named organisation and remains publicly accessible. Keep the privacy note about external media visible.

## Editorial and safety principles

- Ridwanah is an educational resource, not a clinic, diagnostic tool or emergency service.
- Do not provide diagnosis, individual treatment plans, medicine dosing or emergency triage.
- Use respectful and non-stigmatising language.
- Distinguish source publication dates from event dates.
- Clearly label third-party material and external video players.
- Do not collect sensitive health data in the static MVP.
- Do not claim medical review unless the reviewer and review details are real and verified.
- Have medical content reviewed by an appropriately qualified healthcare professional before presenting it as medically reviewed.
- Obtain legal review of the final privacy notice and terms after the operating entity, hosting provider and contact route are confirmed.

## Security, privacy and SEO notes

- The current version has no account registration, contact form, analytics package or advertising integration.
- Video embeds use YouTube's privacy-enhanced player domain; external media providers still have their own data practices.
- A production canonical URL and XML sitemap should be configured only after the final domain is selected.
- `public/robots.txt` allows public pages to be crawled. Add the final sitemap URL after production domain configuration.
- Recheck metadata, keyboard navigation, contrast, mobile layout and external links as part of release testing.

## Before public launch

The GitHub build is not the same as a production launch. Before deployment:
1. Complete an editorial review of all educational and news content.
2. Obtain qualified medical review for health guides that will carry a reviewed label.
3. Confirm the legal operator, privacy contact, privacy notice and terms with appropriate advice.
4. Select and configure the production domain, canonical URL and sitemap.
5. Verify every route and external link on the production host.
6. Run a final mobile, desktop, accessibility and performance audit.

Cloudflare or another production host should be configured only after those checks are complete.

## Brand

- Deep teal: `#075e59`
- Dark teal: `#073f42`
- Mint: `#a8e5d7`
- Coral: `#ff806b`
- Warm white: `#fbfdfc`

The official project name is **Ridwanah**.
