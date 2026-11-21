import { defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "ridwanah-preview",
    compatibilityDate: "2026-11-20",
    assets: {
      htmlHandling: "auto-trailing-slash",
      notFoundHandling: "404-page"
    },
    workersDev: true
  }
});
