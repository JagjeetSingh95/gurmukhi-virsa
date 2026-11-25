// Culture content (D12/D13). Draft text — Sikh reviewer must sign off. Gurus are never drawn.
import type { IconName } from "@/components/icons";
import culture from "@/content/culture.json";
import sakhiData from "@/content/sakhis.json";

export type Guru = {
  id: string;
  numeral: string;
  name: string;
  gurmukhi: string;
  years: string;
  role: string;
  born: string;
  facts: string[];
  teachings?: { gurmukhi: string; roman: string; meaning: string }[];
};
export type SakhiPage = { scene: string; en: string; pa: string };
export type Sakhi = {
  id: string;
  title: string;
  gurmukhi: string;
  roman: string;
  guru: string;
  minutes: number;
  free: boolean;
  summary: string;
  tagline: string;
  lesson: string;
  audio: string | null;
  pages: SakhiPage[];
};
export type Gurdwara = { id: string; name: string; gurmukhi: string; place: string; tags: string[]; free: boolean; guru?: string; about: string[] };
export type GurpurabKind = "gurpurab" | "shaheedi" | "festival";
export type Gurpurab = { id: string; title: string; kind: GurpurabKind; when: string; guru?: string; dates: Record<string, string> };

export const gurus = culture.gurus as Guru[];
export const tenGurus = gurus.filter((g) => g.id !== "granth");
export const granth = gurus.find((g) => g.id === "granth")!;
export const guruById = (id: string) => gurus.find((g) => g.id === id);

export const sakhis = sakhiData.sakhis as Sakhi[];
/** "Sacha Sauda — The True Bargain"; just the title when it already contains the Roman name. */
export const sakhiHeading = (s: Sakhi) => (s.title.includes(s.roman) ? s.title : `${s.roman} — ${s.title}`);
export const sakhiById = (id: string) => sakhis.find((s) => s.id === id);
export const sakhisForGuru = (id: string) => sakhis.filter((s) => s.guru === id);
export const FREE_SAKHIS = sakhis.filter((s) => s.free).length;

export const fiveKs = culture.fiveKs;
export const gurdwaras = culture.gurdwaras as Gurdwara[];
export const gurdwaraById = (id: string) => gurdwaras.find((g) => g.id === id);
export const gurpurabs = culture.gurpurabs as Gurpurab[];
export const etiquette = culture.etiquette as { icon: IconName; title: string; body: string }[];
export const etiquetteQuiz = culture.etiquetteQuiz as { q: string; options: string[]; answer: number }[];

/** Today's story rotates daily through the sakhis this user can open. */
export function todaysSakhi(isFamily: boolean, date = new Date()) {
  const pool = sakhis.filter((s) => isFamily || s.free);
  const day = Math.floor(date.getTime() / 86_400_000);
  return pool[day % pool.length];
}

export const sections: { href: string; label: string; gurmukhi: string; glyph?: string; icon?: IconName; tint: string }[] = [
  { href: "/culture/gurus", label: "10 Gurus", gurmukhi: "ਦਸ ਗੁਰੂ", glyph: "੧੦", tint: "bg-brand-soft text-brand-text" },
  { href: "/culture/sakhis", label: "Sakhis", gurmukhi: "ਸਾਖੀਆਂ", icon: "book", tint: "bg-info-bg text-info" },
  { href: "/culture/5ks", label: "5 Ks", gurmukhi: "ਪੰਜ ਕਕਾਰ", glyph: "੫", tint: "bg-navy-50 text-navy-800 dark:bg-navy-900 dark:text-navy-50" },
  { href: "/culture/gurdwaras", label: "Gurdwaras", gurmukhi: "ਗੁਰਦੁਆਰੇ", icon: "culture", tint: "bg-reward-bg text-reward" },
  { href: "/culture/gurpurabs", label: "Gurpurabs", gurmukhi: "ਗੁਰਪੁਰਬ", icon: "calendar", tint: "bg-success-bg text-success" },
  { href: "/culture/etiquette", label: "Etiquette", gurmukhi: "ਮਰਯਾਦਾ", icon: "heart", tint: "bg-error-bg text-error" },
];
