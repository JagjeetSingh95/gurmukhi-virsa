"use client";
// N.9.3 Save a bani for offline reading (reader header). No mascot/art — Paath area stays plain.
import { useState } from "react";
import { Icon } from "@/components/icons";
import { useToast } from "@/components/ui/feedback";
import { cn } from "@/lib/cn";
import { offlineSupported, removeBani, saveBani, useDownloads } from "@/lib/offline";

export function DownloadButton({ slug, title }: { slug: string; title: string }) {
  const toast = useToast();
  const downloads = useDownloads();
  const [pct, setPct] = useState<number | null>(null);
  if (!offlineSupported()) return null;
  const saved = downloads.some((d) => d.slug === slug);

  const onClick = async () => {
    if (pct !== null) return;
    if (saved) {
      await removeBani(slug);
      return toast(`${title} removed from this device`, "info");
    }
    setPct(0);
    try {
      await saveBani(slug, setPct);
      toast(`${title} saved — you can read it offline`, "success");
    } catch {
      toast("Couldn't save for offline. Check your connection.", "error");
    }
    setPct(null);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={pct !== null ? `Saving ${title} for offline, ${Math.round(pct * 100)}%` : saved ? `Saved offline — remove ${title} from this device` : `Save ${title} for offline`}
      className={cn("relative grid size-11 place-items-center rounded-full hover:bg-sunken", saved ? "text-success" : "text-ink-2")}
    >
      {pct !== null ? (
        <span className="relative grid size-6 place-items-center">
          <svg viewBox="0 0 24 24" className="absolute inset-0 -rotate-90" aria-hidden>
            <circle cx="12" cy="12" r="10" fill="none" stroke="var(--border-default)" strokeWidth="3" />
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${pct * 62.8} 62.8`} />
          </svg>
        </span>
      ) : (
        <Icon name={saved ? "download-done" : "download"} />
      )}
    </button>
  );
}
