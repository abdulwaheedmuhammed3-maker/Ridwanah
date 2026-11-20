# Ridwanah content review workflow

This document is an operational checklist for future editorial and qualified clinical review. It is not evidence that any content has already been reviewed.

## Status definitions

Use only these statuses:

- **Draft** — content is being prepared and has not completed source or editorial checks.
- **Editorial review pending** — the draft is awaiting fact-checking, clarity, attribution and link review.
- **Medical review pending** — editorial work has been completed, but qualified clinical review has not been completed.
- **Approved for publication** — the required editorial and clinical approvals have been recorded.
- **Needs revision** — a reviewer has requested changes; publication approval is withheld.
- **Archived** — the content has been withdrawn or replaced and should no longer be promoted as current.

Never mark a page medically reviewed just because an AI tool, editor, student, general reader or non-clinical reviewer has read it.

## Health article review

For each guide in `src/data/articles.ts`, use the following checklist.

### Source and evidence review

- [ ] Every health claim is supported by a cited primary or reputable source.
- [ ] Source title, organisation, direct URL and publication/update date are correct.
- [ ] The source still opens and supports the claim as written.
- [ ] Recommendations are not stronger or more specific than the cited guidance.
- [ ] Age groups, populations, units, timeframes and limitations are preserved accurately.
- [ ] Conflicting or uncertain evidence is described as uncertain.
- [ ] No source text has been copied beyond what is permitted.

### Clinical review

- [ ] The reviewer is an appropriately qualified healthcare professional for the topic.
- [ ] The reviewer independently checks medical accuracy and safety.
- [ ] Contraindications, red flags and advice-seeking language are appropriate.
- [ ] The article is general education and does not become an individual diagnosis or treatment plan.
- [ ] Language is respectful, accessible and non-stigmatising.
- [ ] All requested amendments have been completed and checked.

### Publication record

Record the following in a private editorial register before changing any public review status:

| Field | Required record |
| --- | --- |
| Article slug | Exact slug from the article data |
| Reviewer name | Real name, used with their permission |
| Professional qualification | Verified qualification relevant to the topic |
| Registration/licensing | Verify where applicable; never invent or infer |
| Review date | Date the final version was actually approved |
| Version reviewed | Git commit SHA or content version |
| Decision | Approved / revisions required / not approved |
| Conditions | Any limitations or follow-up review date |
| Permission | Confirmation to display reviewer details publicly |

Do not store sensitive reviewer identity documents or personal health data in the public repository.

Only after the record is complete and approval is explicit may the site show a reviewer name, qualification or review date. Keep the public status as pending until then.

## Health news review

For each entry in `src/data/news.ts`:

- [ ] Open the original report and confirm it is from the named organisation.
- [ ] Confirm the headline and source publication date.
- [ ] Distinguish publication date from event date.
- [ ] Attribute official announcements, estimates and targets to the organisation that made them.
- [ ] Do not present a reported snapshot as a live outbreak count or alert.
- [ ] Keep the summary within the scope of the report.
- [ ] Check whether a newer official update changes the context.
- [ ] Check the destination URL and opening behaviour.
- [ ] Remove, update or archive stale information.

For outbreaks, emergencies, recalls, advisories or other rapidly changing topics, recheck the latest official source immediately before featuring the story.

## Videos and campaigns

- [ ] Confirm the video is published by the named organisation.
- [ ] Confirm the title, publication date, channel and video ID.
- [ ] Confirm the embed and original source link work.
- [ ] Explain that the video is third-party material and not a Ridwanah endorsement.
- [ ] Confirm annual campaign dates and themes from the current official campaign page.
- [ ] Do not imply Ridwanah is an official campaign partner without a verified agreement.

## Corrections and maintenance

When an error is reported:

1. Record the page, claim, source and date of the report.
2. Recheck the claim against the original source and any newer authoritative guidance.
3. Correct or remove unsafe or materially inaccurate content promptly.
4. Record the correction, date and affected content version in the editorial register.
5. Rerun `npm run check`, `npm run build` and `npm run audit`.

Do not overwrite the history of a clinical approval. A material revision should be sent back for review when it changes the medical meaning, safety advice or recommendations.

## Current content boundary

The current public content is educational draft material. No clinician reviewer has been recorded in the repository. Do not describe any article as medically reviewed until a real qualified professional has completed the process above.
