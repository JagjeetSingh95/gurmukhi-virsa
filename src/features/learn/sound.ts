"use client";
// Feedback tones (colour + icon + sound, U.7). Simple synthesized beeps — not voices.
import { readPrefs } from "@/lib/prefs";

let ctx: AudioContext | null = null;
export function tone(kind: "right" | "wrong" | "done") {
  if (!readPrefs().sounds) return; // Settings → Sounds in quizzes (N.9.1)
  try {
    ctx ??= new AudioContext();
    const notes = kind === "right" ? [660, 880] : kind === "wrong" ? [300, 220] : [523, 659, 784];
    notes.forEach((f, i) => {
      const o = ctx!.createOscillator();
      const g = ctx!.createGain();
      o.frequency.value = f;
      o.type = "sine";
      g.gain.setValueAtTime(0.0001, ctx!.currentTime + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.15, ctx!.currentTime + i * 0.12 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx!.currentTime + i * 0.12 + 0.18);
      o.connect(g).connect(ctx!.destination);
      o.start(ctx!.currentTime + i * 0.12);
      o.stop(ctx!.currentTime + i * 0.12 + 0.2);
    });
  } catch {}
}

/** Play a recorded clip if we have one (real voices only). Returns false when there's no audio. */
export function playClip(url: string | null | undefined) {
  if (!url) return false;
  try {
    void new Audio(url).play();
    return true;
  } catch {
    return false;
  }
}
