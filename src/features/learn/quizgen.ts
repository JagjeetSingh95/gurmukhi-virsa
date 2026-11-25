// Question generators for letter lessons, reviews and practice (D10).
import { letters, shuffle, type Letter } from "./content";

export type Option = { id: string; label: string; gurmukhi?: boolean; emoji?: string | null };
export type Question = {
  id: string;
  prompt: string;
  sub?: string;
  big?: { text: string; gurmukhi?: boolean; emoji?: string | null };
  options: Option[];
  answer: string;
  letterId?: string; // for practice tracking
  explain: string; // shown after answering
  audio?: string | null; // when a real recording exists the prompt becomes "Tap the letter you hear"
};

const distractors = (l: Letter, pool: Letter[], n = 3) => shuffle(pool.filter((x) => x.id !== l.id)).slice(0, n);

/** "Which one is Kakkaa?" (listen variant when audio exists) */
export function findLetter(l: Letter, pool: Letter[]): Question {
  const opts = shuffle([l, ...distractors(l, pool)]).map((x) => ({ id: x.id, label: x.letter, gurmukhi: true }));
  return {
    id: `find-${l.id}`,
    prompt: l.audio ? "Tap the letter you hear" : `Which one is ${l.name}?`,
    sub: l.audio ? undefined : `“${l.sound}”`,
    options: opts,
    answer: l.id,
    letterId: l.id,
    audio: l.audio,
    explain: `${l.letter} — ${l.name}`,
  };
}

/** Show the letter, pick its name. */
export function nameLetter(l: Letter, pool: Letter[]): Question {
  const opts = shuffle([l, ...distractors(l, pool)]).map((x) => ({ id: x.id, label: x.name }));
  return { id: `name-${l.id}`, prompt: "What is this letter called?", big: { text: l.letter, gurmukhi: true }, options: opts, answer: l.id, letterId: l.id, explain: `${l.letter} — ${l.name}` };
}

/** Picture word → first letter. Only for letters with an example word. */
export function firstSound(l: Letter, pool: Letter[]): Question | null {
  if (!l.example) return null;
  const opts = shuffle([l, ...distractors(l, pool)]).map((x) => ({ id: x.id, label: x.letter, gurmukhi: true }));
  return {
    id: `first-${l.id}`,
    prompt: `Which letter does ${l.example.roman} (${l.example.en}) start with?`,
    big: { text: l.example.gurmukhi, gurmukhi: true, emoji: l.example.emoji },
    options: opts,
    answer: l.id,
    letterId: l.id,
    explain: `${l.example.gurmukhi} starts with ${l.letter} (${l.name})`,
  };
}

/** Pool of letters the child has met so far (at least 4). */
export function poolUpTo(index: number) {
  const pool = letters.filter((l) => l.index <= Math.max(index, 4));
  return pool.length >= 4 ? pool : letters.slice(0, 4);
}

export function lessonQuestions(l: Letter): Question[] {
  const pool = poolUpTo(l.index + 2);
  return [findLetter(l, pool), nameLetter(l, pool), firstSound(l, pool) ?? findLetter(l, letters)].map((q, i) => ({ ...q, id: `${q.id}-${i}` }));
}

export function mixedQuestions(items: Letter[], count: number, pool = letters): Question[] {
  const gens = [findLetter, nameLetter, firstSound];
  const out: Question[] = [];
  let i = 0;
  while (out.length < count && i < count * 4) {
    const l = items[i % items.length];
    const q = gens[(i + Math.floor(Math.random() * 3)) % 3](l, pool);
    if (q) out.push({ ...q, id: `${q.id}-${i}` });
    i++;
  }
  return shuffle(out);
}
