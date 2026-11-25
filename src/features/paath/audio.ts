// Audio ↔ line sync helpers (N.4.3). Line timings live in bani JSON as { start, end } seconds.
export type Timed = { i: number; audio: { start: number; end: number } | null; section: number };

/** Index (global line number) of the line playing at time t, or null. */
export function lineAtTime(lines: Timed[], t: number): number | null {
  let lo = 0;
  let hi = lines.length - 1;
  let best: number | null = null;
  // Lines are in order; binary search over those with timings.
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const a = lines[mid].audio;
    if (!a) {
      // Fall back to linear scan when timings are sparse.
      const hit = lines.find((l) => l.audio && t >= l.audio.start && t < l.audio.end);
      return hit ? hit.i : null;
    }
    if (t < a.start) hi = mid - 1;
    else if (t >= a.end) lo = mid + 1;
    else {
      best = lines[mid].i;
      break;
    }
  }
  return best;
}

/** Start/end seconds for a repeat range: one line, one section or the whole bani. */
export function repeatRange(lines: Timed[], current: number, mode: "line" | "section" | "bani"): [number, number] | null {
  const timed = lines.filter((l) => l.audio);
  if (!timed.length) return null;
  const cur = lines.find((l) => l.i === current);
  const pick = mode === "line" ? timed.filter((l) => l.i === current) : mode === "section" ? timed.filter((l) => l.section === cur?.section) : timed;
  if (!pick.length) return null;
  return [pick[0].audio!.start, pick[pick.length - 1].audio!.end];
}

export const fmtTime = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");
