"use client";
// Quiz runner (D10): tap or press 1–4 · Check (Enter) · feedback = colour + icon + sound · Continue.
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { Sheru } from "@/components/sheru/Sheru";
import { Button } from "@/components/ui/controls";
import { QuizTile } from "@/components/ui/feedback";
import { cn } from "@/lib/cn";
import type { Question } from "./quizgen";
import { playClip, tone } from "./sound";

export type QuizResult = { correct: number; total: number; ms: number; wrongLetters: string[] };

export function Quiz({
  questions,
  onProgress,
  onDone,
  onAnswer,
}: {
  questions: Question[];
  onProgress?: (done: number) => void;
  onDone: (r: QuizResult) => void;
  onAnswer?: (q: Question, correct: boolean) => void;
}) {
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const wrongs = useRef<string[]>([]);
  const t0 = useRef(0);
  const q = questions[i];
  const right = checked && pick === q?.answer;

  useEffect(() => {
    t0.current = performance.now();
  }, []);

  const check = useCallback(() => {
    if (!pick || checked) return;
    const ok = pick === q.answer;
    setChecked(true);
    tone(ok ? "right" : "wrong");
    if (ok) setCorrect((c) => c + 1);
    else if (q.letterId) wrongs.current.push(q.letterId);
    onAnswer?.(q, ok);
  }, [pick, checked, q, onAnswer]);

  const next = useCallback(() => {
    const n = i + 1;
    onProgress?.(n);
    if (n >= questions.length) {
      onDone({ correct, total: questions.length, ms: performance.now() - t0.current, wrongLetters: wrongs.current });
      return;
    }
    setI(n);
    setPick(null);
    setChecked(false);
  }, [i, questions.length, correct, onDone, onProgress]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea")) return;
      const n = Number(e.key);
      if (!checked && n >= 1 && n <= (q?.options.length ?? 0)) setPick(q.options[n - 1].id);
      else if (e.key === "Enter") {
        e.preventDefault();
        if (checked) next();
        else check();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [checked, q, next, check]);

  if (!q) return null;
  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex flex-col gap-1 pt-2">
        <h1 className="text-h2">{q.prompt}</h1>
        {q.sub && <p className="text-body text-ink-2">{q.sub}</p>}
      </div>
      {q.audio && (
        <Button variant="navy" size="sm" className="self-start" icon={<Icon name="volume" size={18} />} onClick={() => playClip(q.audio)}>
          Listen again
        </Button>
      )}
      {q.big && (
        <div className="flex flex-col items-center gap-1 rounded-2xl bg-surface py-6 shadow-[0_3px_0_var(--border-default)]">
          {q.big.emoji && <span className="text-[56px] leading-none" aria-hidden>{q.big.emoji}</span>}
          <span lang={q.big.gurmukhi ? "pa" : undefined} className={q.big.gurmukhi ? "text-letter-l text-navy-800 dark:text-navy-50" : "text-h1"}>
            {q.big.text}
          </span>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3" role="group" aria-label="Answers">
        {q.options.map((o, k) => (
          <QuizTile
            key={o.id}
            index={k + 1}
            label={o.label}
            gurmukhi={o.gurmukhi}
            state={checked ? (o.id === q.answer ? "correct" : o.id === pick ? "wrong" : "idle") : pick === o.id ? "selected" : "idle"}
            onClick={() => !checked && setPick(o.id)}
          />
        ))}
      </div>
      <div className="mt-auto" />
      <div
        role="status"
        className={cn(
          "-mx-5 flex flex-col gap-3 rounded-t-2xl px-5 pb-1 pt-4 transition-colors",
          checked ? (right ? "bg-success-bg" : "bg-error-bg") : "bg-transparent",
        )}
      >
        {checked && (
          <div className="flex items-center gap-3">
            <Sheru mood={right ? "cheer" : "oops"} size={48} decorative />
            <div>
              <p className={cn("text-h3", right ? "text-success" : "text-error")}>{right ? "Great job!" : "Oops! Not quite."}</p>
              <p className="text-[15px] font-bold text-ink">{q.explain}</p>
            </div>
          </div>
        )}
        {checked ? (
          <Button variant={right ? "success" : "primary"} block onClick={next}>
            Continue
          </Button>
        ) : (
          <Button block disabled={!pick} onClick={check}>
            Check
          </Button>
        )}
      </div>
    </div>
  );
}
