"use client";
// N.5.2 Letter lesson (D09) → tracing (N.5.3) → 3 quiz questions (N.5.4) → lesson complete + progress sync.
import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { Sheru } from "@/components/sheru/Sheru";
import { Button } from "@/components/ui/controls";
import { Complete, starsFor } from "./Complete";
import { letterById } from "./content";
import { useLearner } from "./learner";
import { LessonShell } from "./LessonShell";
import { LockedScreen } from "./Locked";
import { badgeFor, nextAfter } from "./nextNode";
import { Quiz, type QuizResult } from "./Quiz";
import { lessonQuestions } from "./quizgen";
import { playClip } from "./sound";
import { Trace } from "./Trace";

type Step = "intro" | "trace" | "quiz" | "done";

export function LetterLesson({ id }: { id: string }) {
  const l = letterById(id)!;
  const L = useLearner();
  const [step, setStep] = useState<Step>("intro");
  const [traced, setTraced] = useState(true);
  const [qDone, setQDone] = useState(0);
  const [result, setResult] = useState<(QuizResult & { saved: "ok" | "locked" | "offline" }) | null>(null);
  const questions = useMemo(() => lessonQuestions(l), [l]);

  if (L.isLocked(l.index <= L.freeLetters)) return <LockedScreen title={`${l.letter} ${l.name}`} />;

  const total = 2 + questions.length; // intro + trace + questions
  const progress = step === "intro" ? 0 : step === "trace" ? (1 / total) * 100 : step === "quiz" ? ((2 + qDone) / total) * 100 : 100;

  const finish = async (r: QuizResult) => {
    const correct = r.correct + (traced ? 1 : 0);
    const stars = starsFor(correct, r.total + 1);
    const saved = await L.record(`letter:${l.id}`, stars);
    setResult({ ...r, correct, total: r.total + 1, saved });
    setStep("done");
  };

  return (
    <LessonShell progress={progress}>
      {step === "intro" && (
        <div className="flex flex-1 flex-col gap-5 animate-pop">
          <p className="pt-2 text-caption font-extrabold tracking-wide text-brand-text">NEW LETTER</p>
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-surface py-8 shadow-[0_4px_0_var(--border-default)]">
            <span lang="pa" className="text-letter-xl text-navy-800 dark:text-navy-50">{l.letter}</span>
            <p className="text-h1">{l.name}</p>
            <p className="text-body-l text-ink-2">{l.sound.startsWith("carries") ? `Vowel carrier — ${l.sound}` : `sounds like ${l.sound}`}</p>
            {l.audio && (
              <Button size="sm" variant="navy" icon={<Icon name="volume" size={18} />} onClick={() => playClip(l.audio)}>
                Listen
              </Button>
            )}
          </div>
          {l.example ? (
            <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4">
              <span className="grid size-16 place-items-center rounded-xl bg-brand-soft text-[40px]" aria-hidden>{l.example.emoji ?? "✨"}</span>
              <div>
                <p lang="pa" className="text-gurmukhi-h">
                  <span className="text-brand-text">{l.example.gurmukhi.slice(0, 1)}</span>
                  {l.example.gurmukhi.slice(1)}
                </p>
                <p className="text-[15px] text-ink-2">{l.example.roman} · {l.example.en}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl bg-info-bg p-4 text-info">
              <Sheru mood="think" size={48} decorative />
              <p className="text-[15px] font-bold">{l.note}</p>
            </div>
          )}
          <div className="mt-auto">
            <Button block onClick={() => setStep("trace")}>Next</Button>
          </div>
        </div>
      )}
      {step === "trace" && (
        <Trace
          letter={l.letter}
          onDone={(ok) => {
            setTraced(ok);
            setStep("quiz");
          }}
        />
      )}
      {step === "quiz" && <Quiz questions={questions} onProgress={setQDone} onAnswer={(q, ok) => q.letterId && L.mark(q.letterId, ok)} onDone={finish} />}
      {step === "done" && result && (
        <Complete
          correct={result.correct}
          total={result.total}
          ms={result.ms}
          streak={Math.max(1, L.streak)}
          badge={badgeFor(Object.keys(L.progress).filter((k) => k.startsWith("letter:")).length)}
          note={
            result.saved === "offline"
              ? "Saved on this device — we'll try to sync later."
              : result.saved === "locked"
                ? "This lesson is part of the Family plan."
                : L.synced
                  ? `Saved to ${L.child?.name}'s progress.`
                  : null
          }
          next={nextAfter(l.id)}
        />
      )}
    </LessonShell>
  );
}
