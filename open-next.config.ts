// N.0.4 — Cloudflare Workers via OpenNext. All routes are static today, so the
// static-assets cache is enough. Switch to R2 cache once Convex-backed pages need ISR.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
