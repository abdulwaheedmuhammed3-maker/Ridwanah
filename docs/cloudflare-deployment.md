# Ridwanah Cloudflare deployment

## Hosting design

Ridwanah is a pre-rendered Astro site served by **Cloudflare Workers Static Assets**. A small Worker entrypoint runs before static asset delivery and applies the preview IP allowlist.

- Worker name: `ridwanah-preview`
- Static build directory: `dist/`
- Asset binding: `ASSETS`
- HTML paths: automatic trailing-slash handling
- Unknown paths: the generated `404.html` is served with HTTP 404
- Preview URL: `https://ridwanah-preview.abdulwaheedmuhammed3-996.workers.dev`
- Version preview URLs are disabled; the workers.dev route remains enabled
- No custom domain is attached yet

Every request is checked before a static file is served. The Worker compares Cloudflare's `CF-Connecting-IP` request header with the private `PREVIEW_ALLOWED_IP` Worker secret. A missing secret, missing client IP header or non-matching IP is denied with HTTP 403. The secret is not stored in source control.

The Worker middleware is in `worker/index.js`; its entrypoint, bindings and all-request middleware routing are configured in `cloudflare.config.ts`. The CLI is pinned in `package.json` at `cf@1.0.0-rc.2`.

## GitHub Actions deployment

The deployment workflow is deliberately manual. It does not deploy on every push.

### 1. Secure the Cloudflare account

Enable two-factor authentication on the Cloudflare account before creating a production credential. Create a narrowly scoped API token for this account with **Workers Scripts: Edit** permission. Do not use a Global API Key and do not paste the token into a source file, issue, commit or chat.

### 2. Add GitHub repository settings

Open the Ridwanah repository:

`Settings → Secrets and variables → Actions`

Create these repository secrets:

| Name | Value |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | The narrowly scoped Cloudflare API token |
| `RIDWANAH_PREVIEW_ALLOWED_IP` | The single IPv4 address allowed to view the preview |

Create this repository variable:

| Name | Value |
| --- | --- |
| `CLOUDFLARE_ACCOUNT_ID` | The Cloudflare account ID for the account that owns the `workers.dev` subdomain |

The account ID is a variable, not a secret. Both the API token and the allowed IP value must remain GitHub Actions secrets. Do not place the allowed IP in source code or commit a `.secrets` file.

### 3. Run a deployment intentionally

1. Open the GitHub **Actions** tab.
2. Select **Deploy Ridwanah preview to Cloudflare**.
3. Select **Run workflow** on the `main` branch.
4. Tick the `publish` confirmation input only when you intend to publish the restricted build to the `workers.dev` address.
5. Start the workflow and wait for all steps to pass.
6. Open the preview from the allowed network and check the homepage, navigation, styles, images and other routes.

The workflow repeats the Astro/TypeScript check, static build, generated-site audit and Worker access tests before deployment. It writes `PREVIEW_ALLOWED_IP` to a temporary, permission-restricted secrets file on the runner, passes it to `cf deploy`, then removes the file.

If the allowed public IP changes, update the `RIDWANAH_PREVIEW_ALLOWED_IP` GitHub Actions secret and run the manual deployment workflow again. Until that deployment completes, access remains limited to the previously deployed allowlist value.

### 4. Verify the restriction

From the allowed IP, the preview should return the site normally. From any other IP, requests for the HTML pages and all static assets should return HTTP 403. The Worker fails closed if the secret is missing. Do not treat a browser-only or client-side check as access protection.

A single-IP allowlist can lock you out when your ISP or mobile network changes your public IP. Keep the repository and Cloudflare account access available so the secret can be updated and the preview redeployed.

## Local deployment

With Node.js installed, a Cloudflare API token available in your shell environment and the allowed IP available as an environment variable:

```bash
npm install
npm run check
npm run build
npm run audit
npm run test:worker-access
printf 'PREVIEW_ALLOWED_IP=%s\n' "$RIDWANAH_PREVIEW_ALLOWED_IP" > .secrets
chmod 600 .secrets
npm run deploy:cloudflare
rm -f .secrets
```

The deploy script builds the static site and runs `cf deploy ./dist --secrets-file .secrets`. The CLI uses `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` from the environment. Never commit either credential or the temporary secrets file.

## Important release boundary

A Cloudflare deployment makes the website reachable on an internet address, even though the preview is IP-restricted. It does **not** mean the content has received clinical or legal approval.

At this stage:
- Health guides may still be marked **medical review pending**.
- The news archive is a manually curated snapshot, not a live health alert service.
- The terms and privacy notice still require qualified legal review.
- A physical Android phone and a real desktop browser still need final review on the deployed site.
- The custom domain, canonical URL and sitemap still need to be configured after the domain is selected.

Treat the first deployment as a technical preview, not an announcement that Ridwanah is a medically reviewed service. Do not remove the pending-review notices or disclaimers to make the site look more authoritative.
