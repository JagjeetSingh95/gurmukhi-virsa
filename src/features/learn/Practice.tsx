"use client";
// N.5.6 Practice weak letters (U11): letters wrong twice come here; 3 right in a row → they leave. Family feature.
import { useMemo, useState } from "react";
import { Sheru } from "@/components/sheru/Sheru";
import { Button, ButtonLink } from "@/components/ui/controls";
import { Complete, starsFor } from "./Complete";
import { letterById, letters } from "./content";
import { useLearner } from "./learner";
import { LessonShell } from "./LessonShell";
import { LockedScreen } from "./Locked";
import { Quiz, type QuizResult } from "./Quiz";
import { mixedQuestions } from "./quizgen";
import { Trace } from "./Trace";

export function Practice() {
  const L = useLearner();
  const weak = L.weak.map((id) => letterById(id)).filter(Boolean) as typeof letters;
  const [step, setStep] = useState<"intro" | "trace" | "quiz" | "done">("intro");
  const [n, setN] = useState(0);
  const [r, setR] = useState<QuizResult | null>(null);
  const questions = useMemo(() => (weak.length ? mixedQuestions(weak, 4) : []), [weak.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (L.isLocked(false)) return <LockedScreen title="Practice mode" />;
  if (!weak.length && step === "intro")
    return (
      <LessonShell progress={0}>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <Sheru mood="proud" size={160} />
          <h1 className="text-h1">No tricky letters right now.</h1>
          <p className="text-body-l text-ink-2">Great work! Letters you get wrong twice will show up here.</p>
          <ButtonLink href="/learn">Back to the path</ButtonLink>
        </div>
      </LessonShell>
    );

  return (
    <LessonShell progress={step === "intro" ? 0 : step === "trace" ? 20 : step === "quiz" ? 20 + (n / questions.length) * 80 : 100}>
      {step === "intro" && (
        <div className="flex flex-1 flex-col items-center gap-5 pt-6 text-center">
          <Sheru mood="cheer" size={120} />
          <h1 className="text-h1">Let&apos;s practise the tricky ones!</h1>
          <div className="flex flex-wrap justify-center gap-3">
            {weak.slice(0, 6).map((l) => (
              <span key={l.id} lang="pa" className="grid size-16 place-items-center rounded-xl bg-surface font-[family-name:var(--font-gurmukhi)] text-[34px] font-bold shadow-[0_3px_0_var(--border-strong)]">
                {l.letter}
              </span>
            ))}
          </div>
          <p className="text-body text-ink-2">5 quick questions · about 2 minutes</p>
          <div className="mt-auto w-full">
            <Button block onClick={() => setStep("trace")}>Start practice</Button>
          </div>
        </div>
      )}
      {step === "trace" && <Trace letter={weak[0].letter} onDone={(ok) => { L.mark(weak[0].id, ok); setStep("quiz"); }} />}
      {step === "quiz" && (
        <Quiz
          questions={questions}
          onProgress={setN}
          onAnswer={(q, ok) => q.letterId && L.mark(q.letterId, ok)}
          onDone={async (res) => {
            await L.record("lesson:practice", starsFor(res.correct, res.total));
            setR(res);
            setStep("done");
          }}
        />
      )}
      {step === "done" && r && <Complete correct={r.correct} total={r.total} ms={r.ms} streak={Math.max(1, L.streak)} next={{ href: "/learn", label: "Back to the path" }} />}
    </LessonShell>
  );
}
