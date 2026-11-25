import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "Virsa",
    description: site.description,
    start_url: "/paath",
    display: "standalone",
    background_color: "#FFFAF3",
    theme_color: "#E07B1F",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
