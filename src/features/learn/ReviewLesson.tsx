"use client";
// Unit review: 5 mixed questions over the unit's letters (N.5.4).
import { useMemo, useState } from "react";
import { Complete, starsFor } from "./Complete";
import { letters } from "./content";
import { useLearner } from "./learner";
import { LessonShell } from "./LessonShell";
import { LockedScreen } from "./Locked";
import { nextAfter } from "./nextNode";
import { Quiz, type QuizResult } from "./Quiz";
import { mixedQuestions, poolUpTo } from "./quizgen";

export function ReviewLesson({ unit }: { unit: number }) {
  const L = useLearner();
  const unitLetters = letters.filter((l) => l.row === unit);
  const questions = useMemo(() => mixedQuestions(unitLetters, 5, poolUpTo(unit * 5)), [unit]); // eslint-disable-line react-hooks/exhaustive-deps
  const [done, setDone] = useState(0);
  const [r, setR] = useState<QuizResult | null>(null);
  if (L.isLocked(unit <= 2)) return <LockedScreen title={`Unit ${unit} review`} />;
  return (
    <LessonShell progress={r ? 100 : (done / questions.length) * 100}>
      {!r ? (
        <Quiz
          questions={questions}
          onProgress={setDone}
          onAnswer={(q, ok) => q.letterId && L.mark(q.letterId, ok)}
          onDone={async (res) => {
            await L.record(`lesson:review-${unit}`, starsFor(res.correct, res.total));
            setR(res);
          }}
        />
      ) : (
        <Complete correct={r.correct} total={r.total} ms={r.ms} streak={Math.max(1, L.streak)} next={nextAfter(`review-${unit}`)} />
      )}
    </LessonShell>
  );
}
