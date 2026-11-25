"use client";
// Learning-time tracker (N.7.1): counts seconds while a child profile is active, the tab is visible and
// someone touched the screen in the last minute (or audio is playing). Sent to Supabase (log_activity) once
// a minute and when the tab is hidden. Nothing is tracked for adult guests.
import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";

const TICK = 5; // seconds
const IDLE = 60_000;
const localDay = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function useActivityTracker(childId: string | null, counting: boolean) {
  const pending = useRef(0);
  const lastInput = useRef(0);
  const on = useRef(counting);
  useEffect(() => {
    on.current = counting;
  }, [counting]);

  useEffect(() => {
    if (!childId) return;
    const flush = () => {
      const s = pending.current;
      if (s < TICK) return;
      pending.current = 0;
      void supabase()
        .rpc("log_activity", { p_child: childId, p_seconds: s, p_day: localDay() })
        .then(({ error }) => {
          if (error) pending.current += Math.min(s, 300); // retry on the next flush
        });
    };
    lastInput.current = Date.now();
    const touch = () => (lastInput.current = Date.now());
    const audioPlaying = () => Array.from(document.querySelectorAll("audio")).some((a) => !a.paused);
    const tick = setInterval(() => {
      if (!on.current) return;
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastInput.current > IDLE && !audioPlaying()) return;
      pending.current += TICK;
      if (pending.current >= 60) flush();
    }, TICK * 1000);
    const onHide = () => document.visibilityState === "hidden" && flush();
    const evs = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    evs.forEach((e) => window.addEventListener(e, touch, { passive: true }));
    document.addEventListener("visibilitychange", onHide);
    return () => {
      clearInterval(tick);
      flush();
      evs.forEach((e) => window.removeEventListener(e, touch));
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [childId]);
}
