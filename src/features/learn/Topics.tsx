"use client";
// N.5.5 Laga Matra · Word builder · Sentences · Numbers/Colours/Family (D11). Family plan.
import { useMemo, useState } from "react";
import { Button, Segmented } from "@/components/ui/controls";
import { Builder } from "./Builder";
import { Complete, starsFor } from "./Complete";
import { everyday, matras, sentences, shuffle, words } from "./content";
import { useLearner } from "./learner";
import { LessonShell } from "./LessonShell";
import { LockedScreen } from "./Locked";
import { nextAfter } from "./nextNode";
import { Quiz, type QuizResult } from "./Quiz";
import type { Question } from "./quizgen";

type Done = { correct: number; total: number; ms: number } | null;

function useFinish(id: string) {
  const L = useLearner();
  const [done, setDone] = useState<Done>(null);
  const finish = async (correct: number, total: number, ms: number) => {
    await L.record(`lesson:${id}`, starsFor(correct, total));
    setDone({ correct, total, ms });
  };
  return { L, done, finish };
}

export function MatraTopic() {
  const { L, done, finish } = useFinish("matra");
  const [sel, setSel] = useState(matras[1]);
  const [quiz, setQuiz] = useState(false);
  const [n, setN] = useState(0);
  const questions: Question[] = useMemo(
    () =>
      shuffle(matras)
        .slice(0, 5)
        .map((m) => ({
          id: m.id,
          prompt: `Which one says “${m.roman}”?`,
          options: shuffle([m, ...shuffle(matras.filter((x) => x.id !== m.id)).slice(0, 3)]).map((x) => ({ id: x.id, label: x.example, gurmukhi: true })),
          answer: m.id,
          explain: `${m.example} — ${m.name} (${m.roman})`,
        })),
    [],
  );
  if (L.isLocked(false)) return <LockedScreen title="Laga Matra" />;
  if (done) return <LessonShell progress={100}><Complete {...done} streak={Math.max(1, L.streak)} next={nextAfter("matra")} /></LessonShell>;
  if (quiz)
    return (
      <LessonShell progress={(n / questions.length) * 100}>
        <Quiz questions={questions} onProgress={setN} onDone={(r: QuizResult) => finish(r.correct, r.total, r.ms)} />
      </LessonShell>
    );
  return (
    <LessonShell progress={0}>
      <div className="flex flex-1 flex-col gap-5 pt-2">
        <h1 className="text-h1">Laga Matra</h1>
        <div className="flex flex-col items-center gap-1 rounded-2xl bg-hl p-5 text-center">
          <p lang="pa" className="font-[family-name:var(--font-gurmukhi)] text-[44px] font-bold">
            ਕ + {sel.sign.length ? `◌${sel.sign}` : ""} = <span className="text-brand-text">{sel.example}</span>
          </p>
          <p className="text-[15px] font-bold">
            {sel.name} · “{sel.roman}” · {sel.note}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Vowel signs">
          {matras.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={sel.id === m.id}
              onClick={() => setSel(m)}
              className={`flex flex-col items-center rounded-xl border-2 bg-surface py-3 ${sel.id === m.id ? "border-brand shadow-[0_3px_0_var(--brand-shadow)]" : "border-line shadow-[0_3px_0_var(--border-default)]"}`}
            >
              <span lang="pa" className="font-[family-name:var(--font-gurmukhi)] text-[32px] font-bold">{m.example}</span>
              <span className="text-caption font-extrabold">{m.name}</span>
              <span className="text-caption text-ink-2">{m.roman}</span>
            </button>
          ))}
        </div>
        <p className="text-caption text-ink-2">Tap a vowel sign to see how it works. Sounds arrive with recorded audio.</p>
        <div className="mt-auto">
          <Button block onClick={() => setQuiz(true)}>Practise vowel signs</Button>
        </div>
      </div>
    </LessonShell>
  );
}

export function WordsTopic() {
  const { L, done, finish } = useFinish("words");
  const [n, setN] = useState(0);
  const items = useMemo(() => shuffle(words).slice(0, 5).map((w) => ({ id: w.id, prompt: `${w.roman} · ${w.en}`, picture: w.emoji, hint: `${w.roman} · ${w.en}`, answer: w.letters, extra: w.distractors })), []);
  if (L.isLocked(false)) return <LockedScreen title="Word builder" />;
  if (done) return <LessonShell progress={100}><Complete {...done} streak={Math.max(1, L.streak)} next={nextAfter("words")} /></LessonShell>;
  return (
    <LessonShell progress={(n / items.length) * 100}>
      <Builder title="Build the word" items={items} onProgress={setN} onDone={finish} />
    </LessonShell>
  );
}

export function SentencesTopic() {
  const { L, done, finish } = useFinish("sentences");
  const [n, setN] = useState(0);
  const items = useMemo(() => shuffle(sentences).map((s) => ({ id: s.id, prompt: `“${s.en}”`, hint: s.roman, answer: s.words, extra: s.distractors })), []);
  if (L.isLocked(false)) return <LockedScreen title="Sentences" />;
  if (done) return <LessonShell progress={100}><Complete {...done} streak={Math.max(1, L.streak)} next={nextAfter("sentences")} /></LessonShell>;
  return (
    <LessonShell progress={(n / items.length) * 100}>
      <Builder title="Make the sentence" items={items} onProgress={setN} onDone={finish} />
    </LessonShell>
  );
}

type Tab = "numbers" | "colours" | "family";
export function EverydayTopic() {
  const { L, done, finish } = useFinish("everyday");
  const [tab, setTab] = useState<Tab>("numbers");
  const [quiz, setQuiz] = useState(false);
  const [n, setN] = useState(0);
  const cards = tab === "numbers" ? everyday.numbers : tab === "colours" ? everyday.colours : everyday.family;
  const questions: Question[] = useMemo(() => {
    const pool = [...everyday.numbers, ...everyday.colours, ...everyday.family];
    return shuffle(pool)
      .slice(0, 5)
      .map((c, k) => ({
        id: `${c.roman}-${k}`,
        prompt: "What does this mean?",
        big: { text: c.w, gurmukhi: true },
        options: shuffle([c, ...shuffle(pool.filter((x) => x.en !== c.en)).slice(0, 3)]).map((x) => ({ id: x.en, label: x.en })),
        answer: c.en,
        explain: `${c.w} — ${c.roman} · ${c.en}`,
      }));
  }, []);
  if (L.isLocked(false)) return <LockedScreen title="Everyday words" />;
  if (done) return <LessonShell progress={100}><Complete {...done} streak={Math.max(1, L.streak)} next={nextAfter("everyday")} /></LessonShell>;
  if (quiz)
    return (
      <LessonShell progress={(n / questions.length) * 100}>
        <Quiz questions={questions} onProgress={setN} onDone={(r) => finish(r.correct, r.total, r.ms)} />
      </LessonShell>
    );
  return (
    <LessonShell progress={0}>
      <div className="flex flex-1 flex-col gap-5 pt-2">
        <h1 className="text-h1">Everyday words</h1>
        <Segmented<Tab> label="Topic" value={tab} onChange={setTab} options={[{ value: "numbers", label: "Numbers" }, { value: "colours", label: "Colours" }, { value: "family", label: "Family" }]} />
        <ul className={`grid gap-3 ${tab === "numbers" ? "grid-cols-5" : "grid-cols-2"}`}>
          {(cards as { w: string; roman: string; en: string; g?: string; hex?: string }[]).map((c) => (
            <li key={c.roman} className="flex flex-col items-center gap-1 rounded-xl border border-line bg-surface p-3 text-center">
              {c.g && <span lang="pa" className="font-[family-name:var(--font-gurmukhi)] text-[30px] font-bold">{c.g}</span>}
              {c.hex && <span className="size-10 rounded-full border border-line-strong" style={{ background: c.hex }} aria-hidden />}
              <span lang="pa" className="font-[family-name:var(--font-gurmukhi)] text-[20px] font-bold">{c.w}</span>
              <span className="text-caption text-ink-2">{c.roman}{tab !== "numbers" ? ` · ${c.en}` : ""}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto">
          <Button block onClick={() => setQuiz(true)}>Quick quiz</Button>
        </div>
      </div>
    </LessonShell>
  );
}
