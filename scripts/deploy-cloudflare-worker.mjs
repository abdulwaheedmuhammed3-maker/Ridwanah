import { createBLAKE3 } from "hash-wasm";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetDirectory = path.join(root, "dist");
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const allowedIp = process.env.RIDWANAH_PREVIEW_ALLOWED_IP?.trim();

const workerName = "ridwanah-preview";
const apiBase = `https://api.cloudflare.com/client/v4/accounts/${accountId}`;
const maxAssetBytes = 25 * 1024 * 1024;

const contentTypes = {
  html: "text/html; charset=utf-8",
  css: "text/css; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  mjs: "text/javascript; charset=utf-8",
  json: "application/json; charset=utf-8",
  map: "application/json; charset=utf-8",
  txt: "text/plain; charset=utf-8",
  xml: "application/xml; charset=utf-8",
  svg: "image/svg+xml",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  ico: "image/x-icon",
  avif: "image/avif",
  woff: "font/woff",
  woff2: "font/woff2",
  ttf: "font/ttf",
  otf: "font/otf",
  mp4: "video/mp4",
  webmanifest: "application/manifest+json"
};

function required(value, name) {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function apiRequest(pathname, options = {}) {
  const response = await fetch(`${apiBase}${pathname}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      ...(options.headers ?? {})
    }
  });

  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Cloudflare API returned non-JSON HTTP ${response.status}`);
  }

  if (!response.ok || payload.success === false) {
    const messages = (payload.errors ?? []).map((item) => item.message).join("; ");
    throw new Error(`Cloudflare API ${options.method ?? "GET"} ${pathname} failed (${response.status}): ${messages || "unknown error"}`);
  }

  return payload;
}

async function listFiles(dir, prefix = "") {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;

    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) {
      files.push(...await listFiles(absolute, relative));
    } else if (entry.isFile()) {
      files.push({ absolute, relative: relative.split(path.sep).join("/") });
    }
  }

  return files;
}

function assetContentType(filePath) {
  const extension = path.extname(filePath).slice(1).toLowerCase();
  return contentTypes[extension] ?? "application/octet-stream";
}

async function createManifest(files) {
  const hasher = await createBLAKE3();
  const manifest = {};
  const byHash = new Map();

  for (const file of files) {
    const fileInfo = await stat(file.absolute);
    if (fileInfo.size > maxAssetBytes) {
      throw new Error(`Asset exceeds Cloudflare's 25 MiB per-file limit: ${file.relative}`);
    }

    const contents = await readFile(file.absolute);
    const extension = path.extname(file.absolute).slice(1);
    const hash = hasher
      .init()
      .update(contents.toString("base64"))
      .update(extension)
      .digest("hex")
      .slice(0, 32);

    manifest[`/${file.relative}`] = { hash, size: contents.length };
    if (!byHash.has(hash)) byHash.set(hash, file);
  }

  return { manifest, byHash };
}

async function createAssetsUploadSession(manifest) {
  const response = await apiRequest(`/workers/scripts/${workerName}/assets-upload-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ manifest })
  });

  const session = response.result;
  if (!session?.jwt || !Array.isArray(session.buckets)) {
    throw new Error("Cloudflare did not return a valid static-assets upload session.");
  }
  return session;
}

async function uploadAssetBuckets(session, byHash) {
  let completionJwt = session.jwt;
  const bucketHashes = session.buckets.flat();

  if (bucketHashes.length === 0) {
    return completionJwt;
  }

  for (const bucket of session.buckets) {
    const form = new FormData();

    for (const hash of bucket) {
      const file = byHash.get(hash);
      if (!file) throw new Error(`Cloudflare requested an asset hash that is absent from dist/: ${hash}`);

      const contents = await readFile(file.absolute);
      const base64 = contents.toString("base64");
      const blob = new Blob([base64], { type: assetContentType(file.absolute) });
      form.append(hash, blob, hash);
    }

    const response = await apiRequest("/workers/assets/upload?base64=true", {
      method: "POST",
      body: form
    });

    completionJwt = response.result?.jwt ?? response.jwt ?? completionJwt;
  }

  return completionJwt;
}

async function uploadWorker(completionJwt) {
  const workerCode = await readFile(path.join(root, "worker", "index.js"), "utf8");

  const metadata = {
    main_module: "worker.js",
    compatibility_date: "2026-11-20",
    assets: {
      jwt: completionJwt,
      config: {
        run_worker_first: true,
        html_handling: "auto-trailing-slash",
        not_found_handling: "404-page"
      }
    },
    bindings: [
      { type: "assets", name: "ASSETS" },
      { type: "secret_text", name: "PREVIEW_ALLOWED_IP", text: allowedIp }
    ]
  };

  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("worker.js", new Blob([workerCode], { type: "application/javascript+module" }), "worker.js");

  return apiRequest(`/workers/scripts/${workerName}`, {
    method: "PUT",
    body: form
  });
}

async function verifyDeployment() {
  const deployments = await apiRequest(`/workers/scripts/${workerName}/deployments`);
  const latest = deployments.result?.deployments?.[0];
  const activeVersion = latest?.versions?.find((version) => version.percentage === 100);

  if (!activeVersion) {
    throw new Error("No 100% active Worker version was found after upload.");
  }

  const versionResponse = await apiRequest(`/workers/scripts/${workerName}/versions/${activeVersion.version_id}`);
  const version = versionResponse.result;
  const resources = version?.resources ?? {};
  const bindings = resources.bindings ?? [];
  const assets = resources.script_runtime?.assets ?? {};

  const hasAssetsBinding = bindings.some((binding) => binding.type === "assets" && binding.name === "ASSETS");
  const hasIpSecret = bindings.some((binding) => binding.type === "secret_text" && binding.name === "PREVIEW_ALLOWED_IP");
  const workerFirst = assets.raw_run_worker_first === true;

  if (!hasAssetsBinding || !hasIpSecret || !workerFirst) {
    throw new Error(`Post-deploy verification failed: assetsBinding=${hasAssetsBinding}, ipSecret=${hasIpSecret}, runWorkerFirst=${workerFirst}, serveDirectly=${assets.serve_directly}`);
  }

  console.log(`Deployed ${workerName} version ${version.number} to 100% traffic.`);
  console.log(`Verified: assets retained/uploaded, PREVIEW_ALLOWED_IP secret bound, and Worker runs before static assets.`);
}

async function main() {
  required(accountId, "CLOUDFLARE_ACCOUNT_ID");
  required(apiToken, "CLOUDFLARE_API_TOKEN");
  required(allowedIp, "RIDWANAH_PREVIEW_ALLOWED_IP");
  const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)$/;
  if (!ipv4Pattern.test(allowedIp)) {
    throw new Error("RIDWANAH_PREVIEW_ALLOWED_IP must contain exactly one valid IPv4 address.");
  }

  const files = await listFiles(assetDirectory);
  if (files.length === 0) throw new Error("dist/ is empty; refusing to upload an empty site.");

  console.log(`Preparing ${files.length} static assets for ${workerName}.`);
  const { manifest, byHash } = await createManifest(files);
  const session = await createAssetsUploadSession(manifest);
  const completionJwt = await uploadAssetBuckets(session, byHash);

  console.log("Uploading Worker middleware and static asset manifest as one version.");
  await uploadWorker(completionJwt);
  await verifyDeployment();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
