# Ridwanah release checklist

This checklist separates a limited technical preview from a public health-education launch. A successful deployment is not evidence of clinical, legal or regulatory approval.

## Technical preview checklist

Complete these items before using the public `workers.dev` preview URL for external testing.

- [ ] Cloudflare account two-factor authentication is enabled.
- [ ] A narrowly scoped Cloudflare API token is stored only as the GitHub `CLOUDFLARE_API_TOKEN` secret.
- [ ] The Cloudflare account ID is stored as the GitHub `CLOUDFLARE_ACCOUNT_ID` Actions variable.
- [ ] GitHub Actions passes Astro/TypeScript validation, static build, generated-site audit, Cloudflare dry run and Playwright tests.
- [ ] The manual deployment workflow is run from the intended `main` commit with the confirmation input enabled.
- [ ] The deployed homepage, every route, navigation, health/news search, filters, source links, video embeds and 404 handling are verified.
- [ ] The preview is described as a technical preview, not a clinically approved service.
- [ ] All pending-review banners, disclaimers and editorial disclosures remain visible.
- [ ] The deployed site is checked on a physical Android phone and a desktop browser.

## Content and clinical safety before public launch

- [ ] All four health education guides have had their source links rechecked.
- [ ] Each guide has been reviewed by an appropriately qualified professional.
- [ ] Reviewer identity, qualification, review date and permission are recorded privately.
- [ ] Public labels match the actual review status.
- [ ] Health news is current and each summary links to its original report.
- [ ] Videos and campaign pages still point to the correct official sources.
- [ ] No content promises diagnosis, treatment, medical triage or emergency response.
- [ ] A correction/reporting contact route is defined and monitored.

## Legal and privacy before public launch

- [ ] The responsible operating entity and its public contact route are confirmed.
- [ ] A qualified legal reviewer has reviewed the terms and privacy notice.
- [ ] Applicable Nigerian requirements and any other target-market requirements have been assessed by qualified counsel.
- [ ] Production hosting logs, retention, cookies and embedded-media behaviour are checked.
- [ ] Any new forms, accounts, analytics or notifications have a documented privacy assessment.
- [ ] No sensitive personal health information is collected without an approved design and lawful basis.

## Technical production release

- [ ] GitHub Actions reports a successful Astro/TypeScript check, static build, generated-site audit, Cloudflare dry run and Playwright browser suite.
- [ ] Desktop and Android devices have been tested on the actual production host.
- [ ] Keyboard navigation, screen-reader labels, contrast and text resizing have been checked.
- [ ] All internal links, external links, video embeds and 404 handling have been tested.
- [ ] The final domain is selected, purchased/controlled and added to the Cloudflare account.
- [ ] The canonical URL, sitemap and robots configuration match the final domain.
- [ ] Production caching, headers and HTTPS behaviour are checked.
- [ ] Backups, deployment rollback and incident contacts are documented.
- [ ] Public launch is explicitly authorised by the project owner.

## Deployment decision

- [ ] Production hosting configuration is reviewed.
- [ ] Final content and visual approval are recorded.
- [ ] Clinical and legal prerequisites are completed.
- [ ] Public launch is explicitly authorised.

A passing GitHub build is necessary but does not by itself constitute medical, legal, accessibility, regulatory or real-device approval. The current four health guides remain pending qualified medical review.
