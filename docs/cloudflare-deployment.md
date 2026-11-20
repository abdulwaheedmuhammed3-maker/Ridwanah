# Ridwanah Cloudflare deployment

## Hosting design

Ridwanah is a pre-rendered Astro site. The deployment target is **Cloudflare Workers Static Assets**, deployed as an assets-only Worker. The project uses Cloudflare's `cf` CLI, not Wrangler.

- Worker name: `ridwanah`
- Static build directory: `dist/`
- HTML paths: automatic trailing-slash handling
- Unknown paths: the generated `404.html` is served with HTTP 404
- Public preview address after deployment: `https://ridwanah.abdulwaheedmuhammed3-996.workers.dev`
- No custom domain is attached yet. A custom domain requires adding a domain/zone to the Cloudflare account and completing DNS configuration.

The Cloudflare configuration is in `cloudflare.config.ts`. The CLI is pinned in `package.json` at `cf@1.0.0-rc.2`.

## GitHub Actions deployment

The deployment workflow is deliberately manual. It does not deploy on every push.

### 1. Secure the Cloudflare account

Enable two-factor authentication on the Cloudflare account before creating a production credential. Create a narrowly scoped API token for this account with **Workers Scripts: Edit** permission. Do not use a Global API Key and do not paste the token into a source file, issue, commit or chat.

### 2. Add GitHub repository settings

Open the Ridwanah repository:

`Settings → Secrets and variables → Actions`

Create this repository secret:

| Name | Value |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | The narrowly scoped Cloudflare API token |

Create this repository variable:

| Name | Value |
| --- | --- |
| `CLOUDFLARE_ACCOUNT_ID` | The Cloudflare account ID for the account that owns the `workers.dev` subdomain |

The account ID is a variable, not a secret. The API token must remain a secret.

### 3. Run a deployment intentionally

1. Open the GitHub **Actions** tab.
2. Select **Deploy Ridwanah to Cloudflare**.
3. Select **Run workflow** on the `main` branch.
4. Tick the `publish` confirmation input only when you intend to publish the current main build to the public `workers.dev` address.
5. Start the workflow and wait for all steps to pass.
6. Open the deployment URL and test the homepage, each public route, all navigation, search and filters, source links, video embeds and the not-found page.

The workflow repeats the Astro/TypeScript check, static build and generated-site audit before it deploys. It uses the repository-pinned Cloudflare CLI.

## Important release boundary

A Cloudflare deployment makes the website reachable on a public internet address. It does **not** mean the content has received clinical or legal approval.

At this stage:
- All four health guides remain marked **medical review pending**.
- The news archive is a manually curated snapshot, not a live health alert service.
- The terms and privacy notice still require qualified legal review.
- A physical Android phone and a real desktop browser still need final review on the deployed site.
- The custom domain, canonical URL and sitemap still need to be configured after the domain is selected.

Treat the first deployment as a technical preview, not an announcement that Ridwanah is a medically reviewed service. Do not remove the pending-review notices or disclaimers to make the site look more authoritative.

## Local deployment

With Node.js installed and a Cloudflare API token available in your shell environment:

```bash
npm install
npm run check
npm run build
npm run audit
npm run deploy:cloudflare
```

The deploy script builds the static site and then runs `cf deploy ./dist`. The CLI uses `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` from the environment. Never commit either value.
