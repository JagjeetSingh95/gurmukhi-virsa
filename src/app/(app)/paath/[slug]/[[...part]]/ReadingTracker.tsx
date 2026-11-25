"use client";
// Remembers the top-most visible line for "Continue reading" (stored on this device only).
import { useEffect } from "react";
import { writeRecent } from "@/features/paath/recent";

export function ReadingTracker({ slug, title, lineCount }: { slug: string; title: string; lineCount: number }) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-line]"));
    if (!els.length) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const save = () => {
      const top = els.find((el) => el.getBoundingClientRect().bottom > 80) ?? els[0];
      const i = Number(top.dataset.line);
      const text = top.querySelector("[lang=pa]")?.textContent ?? "";
      writeRecent({ slug, title, lineIndex: i, lineCount, section: Number(top.dataset.section ?? 0), preview: text, at: Date.now() });
    };
    const onScroll = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(save, 400);
    };
    save();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timer) clearTimeout(timer);
    };
  }, [slug, title, lineCount]);
  return null;
}
