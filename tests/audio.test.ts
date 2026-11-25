import { lineAtTime, repeatRange, fmtTime } from "../src/features/paath/audio.ts";
const L = [
  { i: 0, section: 0, audio: { start: 0, end: 4 } },
  { i: 1, section: 1, audio: { start: 4, end: 9 } },
  { i: 2, section: 1, audio: { start: 9, end: 15 } },
  { i: 3, section: 2, audio: { start: 15, end: 20 } },
];
const eq = (a: unknown, b: unknown, m: string) => { if (JSON.stringify(a) !== JSON.stringify(b)) { console.error("FAIL", m, a, b); process.exit(1); } };
eq(lineAtTime(L, 0), 0, "t0"); eq(lineAtTime(L, 4), 1, "boundary"); eq(lineAtTime(L, 14.9), 2, "mid"); eq(lineAtTime(L, 25), null, "after");
eq(repeatRange(L, 2, "line"), [9, 15], "line"); eq(repeatRange(L, 2, "section"), [4, 15], "section"); eq(repeatRange(L, 2, "bani"), [0, 20], "bani");
eq(lineAtTime([{ i: 0, section: 0, audio: null }, ...L.slice(1)], 5), 1, "sparse");
eq(fmtTime(125), "2:05", "fmt");
console.log("audio sync tests passed");
