# Ridwanah Cloudflare deployment

## Hosting design

Ridwanah is a pre-rendered Astro site served by **Cloudflare Workers Static Assets**. The preview Worker now runs an IP gate before serving any static asset.

- Worker name: `ridwanah-preview`
- Static assets: retained from the existing deployed Worker version
- Asset binding: `ASSETS`
- HTML paths: automatic trailing-slash handling
- Unknown paths: the generated `404.html` is served with HTTP 404
- Preview URL: `https://ridwanah-preview.abdulwaheedmuhammed3-996.workers.dev`

The Worker entrypoint is in `worker/index.js`. Cloudflare was updated using the Worker Script Upload API with `keep_assets: true`, so the existing static assets were retained while the Worker middleware was added. The assets configuration runs the Worker before every matching request.

## Finish the single-IP allowlist in the Cloudflare dashboard

The Worker intentionally fails closed until its private secret is configured. Until the secret exists, all visitors receive HTTP 403.

1. Open **Workers & Pages** in the Cloudflare dashboard.
2. Select `ridwanah-preview`.
3. Open **Settings**.
4. Find **Runtime variables and secrets**.
5. Select **Add** and choose **Secret**.
6. Enter this exact variable name: `PREVIEW_ALLOWED_IP`.
7. Enter the one permitted IPv4 address supplied by the owner.
8. Save and select **Deploy**.

Do not add any other IP address or a comma-separated list. The Worker compares Cloudflare's `CF-Connecting-IP` request header to this secret. A missing secret, missing client-IP header, or non-matching address receives HTTP 403 with `Cache-Control: no-store`.

Once the secret is deployed, test the preview from the permitted network. A different network should be denied. An IP allowlist identifies a public network address, not a unique handset; devices sharing the same public egress IP may also pass. Mobile carrier IP addresses can change, which can lock the owner out until the secret is updated.

## Important deployment warning

**Do not run an assets-only upload such as `cf deploy ./dist` against this Worker while the IP gate is active.** An assets-only deployment replaces the Worker entrypoint and would remove the access check. The manual deployment workflow is intentionally disabled to prevent an accidental unguarded release.

Any future preview content deployment must upload the new static assets and preserve/reapply the Worker middleware in the same controlled release. Do not re-enable the assets-only workflow until that combined deployment path has been tested.

The CI dry run validates the existing static-site build. The Worker access middleware has unit tests in `tests/worker-access.test.mjs` for:
- The configured IP being forwarded to static assets
- An unapproved IP being denied before assets are fetched
- A missing Cloudflare client-IP header failing closed
- A missing allowlist secret failing closed

## Important release boundary

A Cloudflare deployment does **not** mean the health content has received clinical or legal approval.

At this stage:
- Health guides may still be marked **medical review pending**.
- The news archive is a manually curated snapshot, not a live health alert service.
- The terms and privacy notice still require qualified legal review.
- A physical Android phone and a real desktop browser still need final review on the deployed site.

Treat the preview as a technical preview, not an announcement that Ridwanah is a medically reviewed service. Do not remove pending-review notices or disclaimers to make the site look more authoritative.
