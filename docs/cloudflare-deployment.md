# Ridwanah Cloudflare deployment

## Hosting design

Ridwanah is a pre-rendered Astro site served by **Cloudflare Workers Static Assets**. The preview uses a small Worker entrypoint to check the requesting IP before any static file is served.

- Worker name: `ridwanah-preview`
- Static build directory: `dist/`
- Asset binding: `ASSETS`
- Preview URL: `https://ridwanah-preview.abdulwaheedmuhammed3-996.workers.dev`
- Main `workers.dev` URL remains enabled; per-version Worker preview URLs are disabled

The Worker code is in `worker/index.js`. It compares Cloudflare's `CF-Connecting-IP` header with the private `PREVIEW_ALLOWED_IP` secret and returns HTTP 403 for every other address. The assets are attached to the same Worker version and the asset routing setting uses `run_worker_first: true`, so HTML, CSS, JavaScript, images, fonts and other static files pass through the check.

## Cloudflare build integration

The existing Workers Builds trigger for this temporary security branch has been excluded from the branch filter. It used `npx cf previews deploy`, which fails because this static Astro project does not produce the `.cloudflare/output` directory that command expects. The guarded GitHub Actions deployment above is the release path for this change. No other Worker build trigger or branch filter was changed.

## Required GitHub Actions secrets

Open the Ridwanah repository:

`Settings → Secrets and variables → Actions → New repository secret`

Create these two repository secrets:

| Secret name | Value |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | A Cloudflare API token with permission to edit Workers scripts for this account |
| `RIDWANAH_PREVIEW_ALLOWED_IP` | The one public IPv4 address that is allowed to access the preview |

Do not add a second IP or a comma-separated list. Do not commit either secret to the repository. The Cloudflare account ID is configured in the workflow and is not a secret.

## Deploy the restricted preview

1. Open the repository's **Actions** tab.
2. Choose **Deploy RIDWANAH IP-restricted preview**.
3. Choose **Run workflow** on the `main` branch.
4. Tick the `publish` confirmation.
5. Start the workflow and wait for its verification step to pass.

The workflow runs Astro checks, builds the site, audits generated pages and sources, and tests the Worker gate. It then computes Cloudflare's BLAKE3 asset manifest, uploads any missing assets, and attaches the Worker entrypoint, assets configuration and IP secret to one new Worker version. The script disables per-version preview URLs while keeping the main `workers.dev` address enabled, then verifies that the deployed version is on 100% traffic, has the `ASSETS` binding and `PREVIEW_ALLOWED_IP` secret binding, and runs the Worker before static assets.

If the workflow reports a missing secret, return to **Settings → Secrets and variables → Actions** and confirm the exact secret names above.

## Updating the allowed IP

If your public IP changes, replace the value in the `RIDWANAH_PREVIEW_ALLOWED_IP` GitHub Actions secret and run the deployment workflow again. Until a successful deployment finishes, the previous IP remains the only allowed address.

An IP allowlist identifies a public network address, not a unique handset. Other devices sharing that same public egress IP may also pass. Mobile carrier IP addresses can change, so a change in your network may temporarily lock you out until you update the secret and redeploy.

## Deployment safety

Do not use an assets-only deployment such as `cf deploy ./dist` against this Worker. It would replace the Worker entrypoint and remove the access check. Use the guarded GitHub Actions workflow so the static assets and Worker middleware are uploaded as one version.

The CI dry run validates the static Astro build, while `tests/worker-access.test.mjs` covers:
- The configured IP being forwarded to static assets
- A different IP being denied before assets are fetched
- A missing Cloudflare client-IP header failing closed
- A missing allowlist secret failing closed

## Important release boundary

A Cloudflare deployment does **not** mean the health content has received clinical or legal approval.

At this stage:
- Health guides may still be marked **medical review pending**.
- The news archive is a manually curated snapshot, not a live health alert service.
- The terms and privacy notice still require qualified legal review.
- A physical Android phone and a real desktop browser still need final review on the deployed site.

Treat the preview as a technical preview, not an announcement that RIDWANAH is a medically reviewed service. Do not remove pending-review notices or disclaimers to make the site look more authoritative.
