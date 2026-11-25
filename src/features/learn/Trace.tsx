"use client";
// N.5.3 Tracing (D10): HTML canvas + pointer events (finger, pen or mouse).
// The letter's own glyph (Baloo Paaji 2) is the guide; "Check" measures how much of the letter was covered
// and how much ink went outside it. Numbered stroke arrows need stroke-order data (not in v1).
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/controls";
import { cn } from "@/lib/cn";
import { tone } from "./sound";

const FONT = '"Baloo Paaji 2", "Noto Sans Gurmukhi", sans-serif';

export function scoreTrace(glyph: Uint8ClampedArray, tolerant: Uint8ClampedArray, ink: Uint8ClampedArray) {
  let glyphPx = 0;
  let covered = 0;
  let inkPx = 0;
  let outside = 0;
  for (let p = 3; p < glyph.length; p += 4) {
    const g = glyph[p] > 40;
    const i = ink[p] > 40;
    if (g) glyphPx++;
    if (i) {
      inkPx++;
      if (g) covered++;
      if (tolerant[p] <= 40) outside++;
    }
  }
  return { coverage: glyphPx ? covered / glyphPx : 0, outside: inkPx ? outside / inkPx : 1, inkPx };
}

export function Trace({ letter, onDone }: { letter: string; onDone: (passed: boolean) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const guide = useRef<HTMLCanvasElement>(null);
  const inkRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState(320);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [tries, setTries] = useState(0);
  const [hasInk, setHasInk] = useState(false);
  const dpr = typeof window !== "undefined" ? Math.min(2, window.devicePixelRatio || 1) : 1;
  const brush = size * 0.075;

  const drawGlyph = useCallback(
    (ctx: CanvasRenderingContext2D, mode: "guide" | "mask" | "tolerant") => {
      const px = size * dpr;
      ctx.clearRect(0, 0, px, px);
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.font = `700 ${size * 0.68}px ${FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const y = size * 0.56;
      if (mode === "guide") {
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--saffron-100") || "#FFE7CC";
        ctx.fillText(letter, size / 2, y);
        ctx.setLineDash([6, 8]);
        ctx.lineWidth = 2;
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--saffron-300") || "#F3AE68";
        ctx.strokeText(letter, size / 2, y);
      } else {
        ctx.fillStyle = "#000";
        ctx.fillText(letter, size / 2, y);
        if (mode === "tolerant") {
          ctx.lineWidth = brush * 1.6;
          ctx.lineJoin = "round";
          ctx.strokeStyle = "#000";
          ctx.strokeText(letter, size / 2, y);
        }
      }
      ctx.restore();
    },
    [letter, size, dpr, brush],
  );

  // Size to the container; redraw when the font is ready.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize(Math.min(420, Math.floor(el.clientWidth))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    let alive = true;
    const paint = () => {
      const g = guide.current?.getContext("2d");
      if (alive && g) drawGlyph(g, "guide");
    };
    paint();
    document.fonts?.load(`700 100px "Baloo Paaji 2"`, letter).then(paint).catch(() => {});
    return () => {
      alive = false;
    };
  }, [drawGlyph, letter, size]);

  const pos = (e: React.PointerEvent) => {
    const r = inkRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const line = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const ctx = inkRef.current!.getContext("2d")!;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--brand") || "#E07B1F";
    ctx.lineWidth = brush;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.restore();
  };

  const clear = () => {
    inkRef.current?.getContext("2d")?.clearRect(0, 0, size * dpr, size * dpr);
    setHasInk(false);
    setMsg(null);
  };

  const check = () => {
    const px = size * dpr;
    const off = (mode: "mask" | "tolerant") => {
      const c = document.createElement("canvas");
      c.width = c.height = px;
      const ctx = c.getContext("2d")!;
      drawGlyph(ctx, mode);
      return ctx.getImageData(0, 0, px, px).data;
    };
    const ink = inkRef.current!.getContext("2d")!.getImageData(0, 0, px, px).data;
    const s = scoreTrace(off("mask"), off("tolerant"), ink);
    const n = tries + 1;
    setTries(n);
    if (s.coverage >= 0.45 && s.outside <= 0.4) {
      tone("right");
      setMsg({ text: "Beautiful tracing!", ok: true });
      setTimeout(() => onDone(true), 700);
    } else {
      tone("wrong");
      setMsg({ text: s.coverage < 0.45 ? "Nice and slow! Cover more of the letter." : "Try to stay inside the letter.", ok: false });
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="pt-2">
        <h1 className="text-h2">
          Trace <span lang="pa" className="font-[family-name:var(--font-gurmukhi)]">{letter}</span>
        </h1>
        <p className="text-body text-ink-2">Use your finger to colour over the letter, slowly.</p>
      </div>
      <div ref={wrap} className="w-full">
        <div className="relative mx-auto touch-none select-none rounded-2xl border-2 border-dashed border-line-strong bg-surface" style={{ width: size, height: size }}>
          <canvas ref={guide} width={size * dpr} height={size * dpr} style={{ width: size, height: size }} className="absolute inset-0" aria-hidden />
          <canvas
            ref={inkRef}
            width={size * dpr}
            height={size * dpr}
            style={{ width: size, height: size }}
            className="absolute inset-0 cursor-crosshair"
            role="img"
            aria-label={`Tracing area for the letter ${letter}`}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              const p = pos(e);
              drawing.current = p;
              line(p, p);
              setHasInk(true);
            }}
            onPointerMove={(e) => {
              if (!drawing.current) return;
              const p = pos(e);
              line(drawing.current, p);
              drawing.current = p;
            }}
            onPointerUp={() => (drawing.current = null)}
            onPointerCancel={() => (drawing.current = null)}
          />
        </div>
      </div>
      {msg && (
        <p role="status" className={cn("text-center text-[16px] font-extrabold", msg.ok ? "text-success" : "text-error")}>
          {msg.text}
        </p>
      )}
      <div className="mt-auto flex gap-3">
        <Button variant="secondary" onClick={clear} disabled={!hasInk}>
          Clear
        </Button>
        <Button block onClick={check} disabled={!hasInk}>
          Check
        </Button>
      </div>
      {tries >= 2 && !msg?.ok && (
        <button type="button" className="text-[14px] font-bold text-ink-3 underline" onClick={() => onDone(false)}>
          Skip tracing for now
        </button>
      )}
    </div>
  );
}
