"use client";
// Tap-to-build exercise (D11): word builder (letters) and sentence ordering (words).
import { useEffect, useState } from "react";
import { Sheru } from "@/components/sheru/Sheru";
import { Button } from "@/components/ui/controls";
import { cn } from "@/lib/cn";
import { shuffle } from "./content";
import { tone } from "./sound";

export type BuildItem = { id: string; prompt: string; picture?: string | null; hint: string; answer: string[]; extra: string[] };

export function Builder({ items, title, onDone, onProgress }: { items: BuildItem[]; title: string; onDone: (correct: number, total: number, ms: number) => void; onProgress?: (n: number) => void }) {
  const [i, setI] = useState(0);
  const [tray, setTray] = useState<{ k: number; t: string }[]>([]);
  const [slots, setSlots] = useState<{ k: number; t: string }[]>([]);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [correct, setCorrect] = useState(0);
  const [t0, setT0] = useState(0);
  const item = items[i];

  useEffect(() => {
    if (!item) return;
    setTray(shuffle([...item.answer, ...item.extra]).map((t, k) => ({ k, t }))); // eslint-disable-line react-hooks/set-state-in-effect
    setSlots([]);
    setChecked(null);
    if (i === 0) setT0(performance.now());
  }, [item, i]);

  if (!item) return null;
  const big = item.answer.length > 3 || item.answer.some((a) => a.length > 2);
  const check = () => {
    const ok = slots.map((s) => s.t).join("|") === item.answer.join("|");
    setChecked(ok);
    tone(ok ? "right" : "wrong");
    if (ok) setCorrect((c) => c + 1);
  };
  const next = () => {
    const n = i + 1;
    onProgress?.(n);
    if (n >= items.length) onDone(correct, items.length, performance.now() - t0);
    else setI(n);
  };

  return (
    <div className="flex flex-1 flex-col gap-5">
      <h1 className="pt-2 text-h2">{title}</h1>
      <div className="flex flex-col items-center gap-1 rounded-2xl bg-surface py-5 shadow-[0_3px_0_var(--border-default)]">
        {item.picture && <span className="text-[56px] leading-none" aria-hidden>{item.picture}</span>}
        <p className="text-h3">{item.prompt}</p>
      </div>
      <div className="flex min-h-20 flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line-strong p-3" aria-label="Your answer">
        {item.answer.map((_, k) => {
          const s = slots[k];
          return (
            <button
              key={k}
              type="button"
              disabled={!s || checked !== null}
              onClick={() => {
                setSlots(slots.filter((_, j) => j !== k));
                setTray([...tray, s]);
              }}
              className={cn(
                "grid min-w-14 place-items-center rounded-xl px-3 font-[family-name:var(--font-gurmukhi)] font-bold",
                big ? "h-14 text-[24px]" : "h-16 text-[34px]",
                s ? "bg-surface shadow-[0_3px_0_var(--border-strong)]" : "border-b-4 border-line-strong",
                checked === true && "bg-success-bg",
                checked === false && "bg-error-bg",
              )}
            >
              <span lang="pa">{s?.t ?? ""}</span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Pieces">
        {tray.map((p) => (
          <button
            key={p.k}
            type="button"
            disabled={checked !== null || slots.length >= item.answer.length}
            onClick={() => {
              setSlots([...slots, p]);
              setTray(tray.filter((x) => x.k !== p.k));
            }}
            className={cn("rounded-xl border-2 border-line-strong bg-surface px-4 font-[family-name:var(--font-gurmukhi)] font-bold shadow-[0_3px_0_var(--border-strong)] active:translate-y-0.5 disabled:opacity-40", big ? "h-12 text-[22px]" : "h-14 text-[30px]")}
          >
            <span lang="pa">{p.t}</span>
          </button>
        ))}
      </div>
      <div className="mt-auto" />
      <div role="status" className={cn("-mx-5 flex flex-col gap-3 rounded-t-2xl px-5 pt-4", checked === true && "bg-success-bg", checked === false && "bg-error-bg")}>
        {checked !== null && (
          <div className="flex items-center gap-3">
            <Sheru mood={checked ? "cheer" : "oops"} size={48} decorative />
            <div>
              <p className={cn("text-h3", checked ? "text-success" : "text-error")}>{checked ? "Great job!" : "Oops! Not quite."}</p>
              <p className="text-[15px] font-bold">
                <span lang="pa" className="font-[family-name:var(--font-gurmukhi)]">{item.answer.join(big ? " " : "")}</span> · {item.hint}
              </p>
            </div>
          </div>
        )}
        {checked === null ? (
          <Button block disabled={slots.length !== item.answer.length} onClick={check}>Check</Button>
        ) : (
          <Button block variant={checked ? "success" : "primary"} onClick={next}>Continue</Button>
        )}
      </div>
    </div>
  );
}
