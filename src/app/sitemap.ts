import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

const pages = ["", "/features", "/pricing", "/about", "/contact", "/download", "/support", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((p) => ({
    url: `${site.url}${p}`,
    changeFrequency: p === "" ? "weekly" : "monthly",
    priority: p === "" ? 1 : p === "/privacy" || p === "/terms" ? 0.3 : 0.7,
  }));
}
