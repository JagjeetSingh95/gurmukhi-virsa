// N.4.5 — Compact offline search index over the bundled banis (first letters, Gurmukhi, Roman, English).
// Run after build-banis.mjs:  node scripts/build-search.mjs
import { readFileSync, writeFileSync } from "node:fs";
import g from "gurmukhi-utils";

const index = JSON.parse(readFileSync("src/content/banis/index.json", "utf8"));
const out = [];
for (const { slug } of index) {
  const bani = JSON.parse(readFileSync(`src/content/banis/${slug}.json`, "utf8"));
  bani.lines.forEach((l, i) => {
    if (l.kind === "heading") return;
    const fl = g.firstLetters(l.gurmukhi).replace(/[॥੦-੯\s]/g, "");
    const flr = l.roman.toLowerCase().split(/\s+/).filter((w) => /^[a-z]/.test(w)).map((w) => w[0]).join("");
    out.push([slug, i, l.section, l.gurmukhi, l.roman, l.en ?? "", fl, flr]);
  });
}
writeFileSync("src/content/banis/search.json", JSON.stringify(out));
console.log(out.length, "lines indexed");
