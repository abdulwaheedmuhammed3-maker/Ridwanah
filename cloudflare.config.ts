import { bindings, defineConfig } from "cf/config";
import * as entrypoint from "./worker/index.js" with { type: "cf-worker" };

export default defineConfig({
  worker: {
    name: "ridwanah-preview",
    entrypoint,
    compatibilityDate: "2026-11-20",
    env: {
      ASSETS: bindings.assets(),
      PREVIEW_ALLOWED_IP: bindings.secret()
    },
    assets: {
      htmlHandling: "auto-trailing-slash",
      notFoundHandling: "404-page",
      runWorkerFirst: true
    },
    previewUrls: false,
    workersDev: true
  }
});
