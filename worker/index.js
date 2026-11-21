const forbiddenResponse = () =>
  new Response("Forbidden", {
    status: 403,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8"
    }
  });

export default {
  async fetch(request, env) {
    const allowedIp = env.PREVIEW_ALLOWED_IP?.trim();
    const connectingIp = request.headers.get("CF-Connecting-IP");

    // Fail closed if the secret is missing or the request did not arrive
    // with a Cloudflare client-IP header.
    if (!allowedIp || !connectingIp || connectingIp !== allowedIp) {
      return forbiddenResponse();
    }

    // All requests, including HTML, scripts, stylesheets and images, pass
    // through this check before Cloudflare serves the static asset.
    return env.ASSETS.fetch(request);
  }
};
