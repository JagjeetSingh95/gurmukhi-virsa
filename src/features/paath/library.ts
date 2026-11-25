// Paath library data (D06). Text comes from src/content/banis (Shabad OS) — never hand-typed.
import index from "@/content/banis/index.json";

export type BaniLine = {
  id: string;
  kind: "heading" | "line";
  section: number;
  gurmukhi: string;
  vishraam: string;
  roman: string;
  en: string | null;
  pa: string | null;
  enKids: string | null;
  audio: { start: number; end: number } | null;
};
export type Bani = {
  slug: string;
  title: string;
  gurmukhi: string;
  minutes: number;
  bedtime: boolean;
  source: string;
  audioUrl: string | null;
  lineCount: number;
  lines: BaniLine[];
};

const display: Record<string, { short: string; tile: string; detail: string; sectionName?: string; sections?: number }> = {
  "mool-mantar": { short: "Mool Mantar", tile: "ਮੂਲ", detail: "1 line" },
  "japji-1-5": { short: "Japji Sahib", tile: "ਜਪੁਜੀ", detail: "Pauris 1–5", sectionName: "Pauri", sections: 5 },
  "kirtan-sohila": { short: "Kirtan Sohila", tile: "ਕੀਰਤਨ", detail: "5 shabads · bedtime" },
  sukhmani: { short: "Sukhmani Sahib", tile: "ਸੁਖਮਨੀ", detail: "24 Ashtpadis", sectionName: "Ashtpadi", sections: 24 },
};

export const library = index.map((b) => ({ ...b, ...display[b.slug] }));
export type LibraryItem = (typeof library)[number];
export const baniSlugs = library.map((b) => b.slug);
export const libraryItem = (slug: string) => library.find((b) => b.slug === slug);

/** Load one bani's full text (code-split per bani). */
export async function loadBani(slug: string): Promise<Bani | null> {
  switch (slug) {
    case "mool-mantar":
      return (await import("@/content/banis/mool-mantar.json")).default as Bani;
    case "japji-1-5":
      return (await import("@/content/banis/japji-1-5.json")).default as Bani;
    case "kirtan-sohila":
      return (await import("@/content/banis/kirtan-sohila.json")).default as Bani;
    case "sukhmani":
      return (await import("@/content/banis/sukhmani.json")).default as Bani;
    default:
      return null;
  }
}

/** Long banis are split into one page per section (Sukhmani: 24 ashtpadis). */
export const pagedBanis: Record<string, number> = { sukhmani: 24 };
export function partOf(slug: string, section: number) {
  return pagedBanis[slug] ? Math.max(1, section) : null;
}
export function lineHref(slug: string, section: number, lineIndex: number) {
  const part = partOf(slug, section);
  return `/paath/${slug}${part && part > 1 ? `/${part}` : ""}#l${lineIndex}`;
}

/** "Pauri 3 of 5" / "Ashtpadi 7 of 24" / null. Japji section 0 = opening (Mool Mantar, Jap, Salok). */
export function sectionLabel(slug: string, section: number) {
  const d = display[slug];
  if (!d?.sectionName || !d.sections || section < 1) return null;
  return `${d.sectionName} ${section} of ${d.sections}`;
}
