// Learn content + path structure (D09). First 10 letters are free; everything else is Family.
import lettersJson from "@/content/letters.json";
import extra from "@/content/learn-extra.json";

export type Letter = {
  id: string;
  index: number;
  row: number;
  letter: string;
  name: string;
  roman: string;
  sound: string;
  example: { gurmukhi: string; roman: string; en: string; emoji: string | null } | null;
  note: string | null;
  free: boolean;
  audio: string | null;
};
export const letters = lettersJson.letters as Letter[];
export const letterById = (id: string) => letters.find((l) => l.id === id);
export const FREE_LETTERS = 10;

export const matras = extra.matras;
export const words = extra.words;
export const sentences = extra.sentences;
export const everyday = extra.everyday;

export type PathNode =
  | { kind: "letter"; id: string; letter: Letter; href: string; free: boolean }
  | { kind: "review"; id: string; unit: number; href: string; free: boolean }
  | { kind: "practice"; id: string; href: string; free: boolean }
  | { kind: "topic"; id: string; title: string; glyph: string; href: string; free: boolean };

export type Unit = { n: number; title: string; subtitle: string; nodes: PathNode[] };

/** 7 letter units (rows of 5) with a review at the end of each, then Laga Matra, words, sentences, everyday. */
export const units: Unit[] = (() => {
  const out: Unit[] = [];
  for (let u = 1; u <= 7; u++) {
    const row = letters.filter((l) => l.row === u);
    const nodes: PathNode[] = row.map((l) => ({ kind: "letter", id: l.id, letter: l, href: `/learn/letter/${l.id}`, free: l.index <= FREE_LETTERS }));
    nodes.push({ kind: "review", id: `review-${u}`, unit: u, href: `/learn/review/${u}`, free: u <= 2 });
    if (u === 2) nodes.push({ kind: "practice", id: "practice", href: "/learn/practice", free: false });
    out.push({ n: u, title: `Unit ${u}`, subtitle: `Letters ${row[0].letter} to ${row[row.length - 1].letter}`, nodes });
  }
  out.push({
    n: 8,
    title: "Unit 8",
    subtitle: "Vowel signs, words and sentences",
    nodes: [
      { kind: "topic", id: "matra", title: "Laga Matra", glyph: "ਕਿ", href: "/learn/matra", free: false },
      { kind: "topic", id: "words", title: "Word builder", glyph: "ਘਰ", href: "/learn/words", free: false },
      { kind: "topic", id: "sentences", title: "Sentences", glyph: "ਮੈਂ", href: "/learn/sentences", free: false },
      { kind: "topic", id: "everyday", title: "Numbers · Colours · Family", glyph: "੧", href: "/learn/everyday", free: false },
    ],
  });
  return out;
})();

export const allNodes = units.flatMap((u) => u.nodes);

/** Progress key used locally and as Supabase item ids (letters: ltr-01…, others: review-1, matra, words…). */
export const progressKey = (n: PathNode) => (n.kind === "letter" ? `letter:${n.id}` : `lesson:${n.id}`);

export function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}
