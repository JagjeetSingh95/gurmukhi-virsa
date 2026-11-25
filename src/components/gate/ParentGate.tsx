"use client";
// N.3.4 — Parent gate (U.4): PIN if set, else maths (4 answers) or 3-second hold.
// Unlocked for 5 min. 3 wrong → 30 s wait (PIN lockout is enforced server-side too).
import { useEffect, useRef, useState } from "react";
import { Button, CodeInput, Segmented } from "@/components/ui/controls";
import { Sheet } from "@/components/ui/feedback";
import { useAuth } from "@/lib/auth";
import { local } from "@/lib/local";
import { supabase } from "@/lib/supabase/client";

function makeSum() {
  const a = 6 + Math.floor(Math.random() * 7);
  const b = 3 + Math.floor(Math.random() * 7);
  const answer = a * b;
  const opts = new Set([answer]);
  while (opts.size < 4) opts.add(answer + (Math.floor(Math.random() * 11) - 5 || 7));
  return { q: `${a} × ${b}`, answer, options: [...opts].sort(() => Math.random() - 0.5) };
}

export function ParentGate({
  open,
  onPass,
  onClose,
  reason = "This area is for grown-ups.",
}: {
  open: boolean;
  onPass: () => void;
  onClose: () => void;
  reason?: string;
}) {
  const { profile } = useAuth();
  const hasPin = !!profile?.has_pin;
  const [method, setMethod] = useState<"maths" | "hold">("maths");
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [secs, setSecs] = useState(0); // lockout countdown
  const [wrong, setWrong] = useState(0);
  const [sum, setSum] = useState<ReturnType<typeof makeSum> | null>(null);
  const [holdPct, setHoldPct] = useState(0);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Already unlocked in the last 5 minutes → pass straight through.
  useEffect(() => {
    if (open && local.gateOpen()) onPass();
  }, [open, onPass]);

  // New sum each time the gate opens (random values can't be pre-rendered).
  useEffect(() => {
    if (open) setSum(makeSum()); // eslint-disable-line react-hooks/set-state-in-effect
  }, [open]);

  useEffect(() => {
    if (secs <= 0) return;
    const t = setTimeout(() => setSecs((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);

  const locked = secs > 0;
  const lock = (seconds = 30) => {
    setSecs(seconds);
    setMsg("Too many tries. Please wait 30 seconds.");
  };
  const pass = () => {
    local.openGate();
    setPin("");
    setMsg(null);
    setWrong(0);
    onPass();
  };
  const fail = () => {
    const n = wrong + 1;
    if (n >= 3) {
      lock();
      setWrong(0);
    } else {
      setWrong(n);
      setMsg(`Not quite — ${3 - n} ${3 - n === 1 ? "try" : "tries"} left.`);
    }
    setSum(makeSum());
  };

  const checkPin = async (value: string) => {
    const { data, error } = await supabase().rpc("verify_parent_pin", { p_pin: value });
    setPin("");
    if (error) return setMsg("Couldn't check the PIN. Try again.");
    const r = data as { ok: boolean; reason?: string; lockedUntil?: string; attemptsLeft?: number };
    if (r.ok) return pass();
    if (r.reason === "LOCKED") return lock(30);
    setMsg(`Wrong PIN — ${r.attemptsLeft ?? 0} ${r.attemptsLeft === 1 ? "try" : "tries"} left.`);
  };

  const stopHold = () => {
    if (holdTimer.current) clearInterval(holdTimer.current);
    holdTimer.current = null;
    setHoldPct(0);
  };
  const startHold = () => {
    if (locked || holdTimer.current) return;
    const t0 = Date.now();
    holdTimer.current = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - t0) / 3000) * 100);
      setHoldPct(pct);
      if (pct >= 100) {
        stopHold();
        pass();
      }
    }, 50);
  };

  return (
    <Sheet open={open} onClose={onClose} title="Grown-ups only">
      <div className="flex flex-col gap-4">
        <p>{reason}</p>
        {locked && (
          <p className="rounded-md bg-reward-bg px-3 py-2 text-[14px] font-bold text-reward" role="status">
            Wait {secs}s before trying again.
          </p>
        )}
        {hasPin ? (
          <CodeInput
            label="Enter your parent PIN"
            length={4}
            secret
            value={pin}
            onChange={(v) => {
              setPin(v);
              if (v.length === 4 && !locked) void checkPin(v);
            }}
            error={msg ?? undefined}
          />
        ) : (
          <div className="flex flex-col gap-4">
            <Segmented
              label="Check method"
              value={method}
              onChange={setMethod}
              options={[
                { value: "maths", label: "Quick sum" },
                { value: "hold", label: "Hold button" },
              ]}
            />
            {method === "maths" && sum ? (
              <div className="flex flex-col gap-3">
                <p className="text-h2 text-ink">What is {sum.q}?</p>
                <div className="grid grid-cols-2 gap-3">
                  {sum.options.map((o) => (
                    <Button key={o} variant="secondary" disabled={locked} onClick={() => (o === sum.answer ? pass() : fail())}>
                      {o}
                    </Button>
                  ))}
                </div>
              </div>
            ) : method === "hold" ? (
              <button
                type="button"
                disabled={locked}
                onPointerDown={startHold}
                onPointerUp={stopHold}
                onPointerLeave={stopHold}
                onKeyDown={(e) => (e.key === " " || e.key === "Enter") && startHold()}
                onKeyUp={stopHold}
                className="relative h-16 overflow-hidden rounded-lg border-2 border-line-strong bg-surface text-[16px] font-extrabold text-ink disabled:opacity-50"
              >
                <span className="absolute inset-y-0 left-0 bg-brand-soft" style={{ width: `${holdPct}%` }} aria-hidden />
                <span className="relative">Press and hold for 3 seconds</span>
              </button>
            ) : null}
            {msg && (
              <p className="text-caption text-error" role="alert">
                {msg}
              </p>
            )}
          </div>
        )}
      </div>
    </Sheet>
  );
}

/** Gate wrapper for whole pages (Parent tab, settings). */
export function GatedPage({ children, reason }: { children: React.ReactNode; reason?: string }) {
  const [ok, setOk] = useState(false);
  const [open, setOpen] = useState(true);
  if (ok) return <>{children}</>;
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-20 text-center">
      <h2 className="text-h2">Grown-ups only</h2>
      <p className="max-w-sm text-body text-ink-2">Ask a parent to unlock this area.</p>
      <Button onClick={() => setOpen(true)}>Unlock</Button>
      <ParentGate open={open} reason={reason} onClose={() => setOpen(false)} onPass={() => setOk(true)} />
    </div>
  );
}
