import assert from "node:assert/strict";
import test from "node:test";

import worker from "../worker/index.js";

const ALLOWED_IP = "203.0.113.9";

function makeRequest(ip) {
  const headers = new Headers();
  if (ip !== undefined) headers.set("CF-Connecting-IP", ip);

  return new Request("https://ridwanah-preview.example.workers.dev/assets/app.js", {
    headers
  });
}

test("allows the configured IP and forwards the original request to static assets", async () => {
  let forwardedRequest;
  const request = makeRequest(ALLOWED_IP);
  const env = {
    PREVIEW_ALLOWED_IP: ALLOWED_IP,
    ASSETS: {
      async fetch(receivedRequest) {
        forwardedRequest = receivedRequest;
        return new Response("asset-ok", { status: 200 });
      }
    }
  };

  const response = await worker.fetch(request, env);

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "asset-ok");
  assert.equal(forwardedRequest, request);
});

test("blocks any other IP before the asset binding is called", async () => {
  let assetFetchCalled = false;
  const env = {
    PREVIEW_ALLOWED_IP: ALLOWED_IP,
    ASSETS: {
      async fetch() {
        assetFetchCalled = true;
        return new Response("should-not-be-reached");
      }
    }
  };

  const response = await worker.fetch(makeRequest("198.51.100.23"), env);

  assert.equal(response.status, 403);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(await response.text(), "Forbidden");
  assert.equal(assetFetchCalled, false);
});

test("fails closed when the Cloudflare client-IP header is missing", async () => {
  let assetFetchCalled = false;
  const env = {
    PREVIEW_ALLOWED_IP: ALLOWED_IP,
    ASSETS: {
      async fetch() {
        assetFetchCalled = true;
        return new Response("should-not-be-reached");
      }
    }
  };

  const response = await worker.fetch(makeRequest(undefined), env);

  assert.equal(response.status, 403);
  assert.equal(assetFetchCalled, false);
});

test("fails closed when the configured allowlist secret is missing", async () => {
  let assetFetchCalled = false;
  const env = {
    ASSETS: {
      async fetch() {
        assetFetchCalled = true;
        return new Response("should-not-be-reached");
      }
    }
  };

  const response = await worker.fetch(makeRequest(ALLOWED_IP), env);

  assert.equal(response.status, 403);
  assert.equal(assetFetchCalled, false);
});
