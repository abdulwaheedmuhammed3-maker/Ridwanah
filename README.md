# Ridwanah

**Learn • Prevent • Live Healthier**

Ridwanah is a digital health education platform designed to make reliable health information easier to understand and use in everyday life.

## Current build

The repository contains the first responsive website foundation:
- Astro + TypeScript
- Mobile-first homepage and navigation
- Ridwanah SVG wordmark, brand mark, and favicon
- Brand colour tokens and responsive styles
- Health education disclaimer and content principles

## Run locally

Requirements: Node.js 22.23.4 or later, matching the current Astro 7 requirement.

```bash
npm install
npm run dev
```

Open the local address printed by Astro. To create a production build:

```bash
npm run check
npm run build
npm run preview
```

## Health library

The first three educational drafts are stored in `src/data/articles.ts` and rendered through:
- `/health` — searchable and filterable article library
- `/health/handwashing-when-and-how`
- `/health/physical-activity-for-adults`
- `/health/healthy-eating-everyday-basics`

To add an article, create a new entry in the `articles` array with a unique slug, category, summary, reading time, publication date, key points, sections, and source links. The detail route is generated from that data automatically.

### Editorial requirements

- Use primary, reputable public-health sources wherever possible.
- Keep claims within the scope of the cited source and avoid unsupported treatment advice.
- Include source title, organisation, date, and direct URL.
- Keep the visible medical-review status as pending until an appropriately qualified professional has actually reviewed and approved the article.
- Never invent reviewer names, professional credentials, review dates, or endorsements.
- Recheck links and guidance before republishing an article after a source is updated.
- Keep the educational disclaimer visible on individual articles.

## Deploy

The site is a static Astro project and can be deployed to Cloudflare Pages or another static host.

- Build command: `npm run build`
- Build output directory: `dist`
- Install command: `npm install`

Set the production domain only after the project owner has selected and configured it.

## Editorial and safety principles

- Use reputable, traceable sources for health information.
- Write in plain language and distinguish established facts from uncertainty.
- Show publication and review dates, source references, and reviewer credentials on health articles.
- Have medical content reviewed by an appropriately qualified healthcare professional before publication.
- Do not offer diagnosis, personalised treatment, or emergency triage.
- Collect as little personal information as possible, especially sensitive health information.

Ridwanah is an educational resource, not a substitute for a qualified healthcare professional.

## Brand

- Deep teal: `#075e59`
- Dark teal: `#073f42`
- Mint: `#a8e5d7`
- Coral: `#ff806b`
- Warm white: `#fbfdfc`

The official project name is **Ridwanah**.
