"use client";
// Lesson frame (D09/D10): close · progress · content. Fills the screen on phones; centred column on web.
import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icons";
import { Progress } from "@/components/ui/display";

export function LessonShell({ progress, children, label = "Lesson progress", exit = "/learn", title = "Lesson" }: { progress: number; children: ReactNode; label?: string; exit?: string; title?: string }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[640px] flex-col px-5 pb-6 pt-3">
      <h1 className="sr-only">{title}</h1>
      <div className="flex items-center gap-3 py-2">
        <Link href={exit} className="grid size-11 place-items-center rounded-full text-ink-2 hover:bg-sunken" aria-label="Close lesson">
          <Icon name="close" />
        </Link>
        <Progress value={progress} label={label} className="h-3 flex-1" />
      </div>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
