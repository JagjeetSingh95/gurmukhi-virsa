import type { MetadataRoute } from "next";
import { baniSlugs, pagedBanis } from "@/features/paath/library";
import { site } from "@/lib/site";

const reader = baniSlugs.flatMap((s) => [`/paath/${s}`, ...Array.from({ length: Math.max(0, (pagedBanis[s] ?? 1) - 1) }, (_, i) => `/paath/${s}/${i + 2}`)]);
const pages = ["", "/features", "/pricing", "/about", "/contact", "/download", "/support", "/privacy", "/terms", "/paath", ...reader];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((p) => ({
    url: `${site.url}${p}`,
    changeFrequency: p === "" ? "weekly" : "monthly",
    priority: p === "" ? 1 : p === "/privacy" || p === "/terms" ? 0.3 : 0.7,
  }));
}
