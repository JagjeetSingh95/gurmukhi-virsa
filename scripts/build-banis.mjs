// N.2.4 — Build app-ready bani JSON from scripts/banis.raw.json (see extract-banis.py).
// Adds transliteration (gurmukhi-utils), strips vishraam marks for display, tags headings + sections.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import g from "gurmukhi-utils";

const raw = JSON.parse(readFileSync("scripts/banis.raw.json", "utf8"));
const meta = {
  "mool-mantar": { title: "Mool Mantar", gurmukhi: "ਮੂਲ ਮੰਤਰ", minutes: 1, tier: "free", bedtime: false },
  "japji-1-5": { title: "Japji Sahib (Pauris 1–5)", gurmukhi: "ਜਪੁਜੀ ਸਾਹਿਬ", minutes: 6, tier: "free", bedtime: false },
  "kirtan-sohila": { title: "Kirtan Sohila", gurmukhi: "ਕੀਰਤਨ ਸੋਹਿਲਾ", minutes: 8, tier: "free", bedtime: true },
  sukhmani: { title: "Sukhmani Sahib", gurmukhi: "ਸੁਖਮਨੀ ਸਾਹਿਬ", minutes: 90, tier: "free", bedtime: false },
};
const HEADING = /^(ਸਲੋਕੁ ॥|ਅਸਟਪਦੀ ॥|॥ ਜਪੁ ॥|ੴ ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ ॥|ਸੋਹਿਲਾ.*|.*(ਮਹਲਾ|ਮਃ) [੧-੯]( .*)? ॥)$/;
const PAURI_END = /॥[੦-੯]+॥\s*$/;
const clean = (s) => s.replace(/[;.,]/g, "").replace(/\s+/g, " ").trim();

mkdirSync("src/content/banis", { recursive: true });
const index = [];
for (const [slug, rows] of Object.entries(raw)) {
  let section = 0;
  let pauri = 0;
  const lines = rows.map((r, i) => {
    const gurmukhi = clean(r.gurmukhiVishraam);
    const kind = HEADING.test(gurmukhi) ? "heading" : "line";
    if (slug === "sukhmani" && gurmukhi === "ਸਲੋਕੁ ॥") section++;
    if (slug === "japji-1-5" && i > 0 && PAURI_END.test(gurmukhi)) pauri++;
    return {
      id: r.id,
      kind,
      section: slug === "sukhmani" ? section : slug === "japji-1-5" ? Math.max(0, pauri - (PAURI_END.test(gurmukhi) ? 1 : 0)) : 0,
      gurmukhi,
      vishraam: r.gurmukhiVishraam,
      roman: g.toEnglish(gurmukhi),
      en: r.en ?? null,
      pa: r.pa ?? null,
      enKids: null, // TODO: simple kids meaning — needs Sikh reviewer sign-off
      audio: null, // { start, end } seconds once R2 recordings exist (real voices only)
    };
  });
  const bani = {
    slug,
    ...meta[slug],
    source: "Shabad OS database (MIT). Translations: Sant Singh Khalsa (en), Prof. Sahib Singh (pa).",
    audioUrl: null,
    lineCount: lines.length,
    lines,
  };
  writeFileSync(`src/content/banis/${slug}.json`, JSON.stringify(bani));
  index.push({ slug, ...meta[slug], lineCount: lines.length });
}
writeFileSync("src/content/banis/index.json", JSON.stringify(index, null, 2));
console.log(index.map((b) => `${b.slug}: ${b.lineCount}`).join("\n"));
