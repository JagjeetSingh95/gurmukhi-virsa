"use client";
// N.9.3 Downloads manager (U11): banis saved on this device, size, storage used, remove one / all.
// Links are plain <a> so they work as full page loads offline (served by the service worker).
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/controls";
import { ConfirmDialog, StateView } from "@/components/ui/feedback";
import { library } from "@/features/paath/library";
import { fmtBytes, offlineSupported, removeAll, removeBani, saveBani, useDownloads, verifyDownloads } from "@/lib/offline";

export function Downloads() {
  const downloads = useDownloads();
  const [busy, setBusy] = useState<string | null>(null);
  const [pct, setPct] = useState(0);
  const [askAll, setAskAll] = useState(false);
  const [quota, setQuota] = useState<{ usage: number; quota: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void verifyDownloads();
    navigator.storage?.estimate?.().then((e) => setQuota({ usage: e.usage ?? 0, quota: e.quota ?? 0 }));
  }, [downloads.length]);

  if (!offlineSupported()) return <StateView kind="offline" art={false} title="Offline reading isn't available" body="This browser can't save banis. Try an up-to-date Chrome, Edge, Safari or Firefox." />;

  const total = downloads.reduce((a, d) => a + d.bytes, 0);
  const save = async (slug: string) => {
    setBusy(slug);
    setPct(0);
    setError(null);
    try {
      await saveBani(slug, setPct);
    } catch {
      setError("Couldn't save. Check your connection and try again.");
    }
    setBusy(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[15px] text-ink-2">Save banis on this device to read without internet. Recordings are saved too once they&apos;re added.</p>
      <ul className="flex flex-col gap-3">
        {library.map((b) => {
          const d = downloads.find((x) => x.slug === b.slug);
          const saving = busy === b.slug;
          return (
            <li key={b.slug} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4">
              <span className={`grid size-10 shrink-0 place-items-center rounded-full ${d ? "bg-success-bg text-success" : "bg-sunken text-ink-2"}`}>
                <Icon name={d ? "download-done" : "download"} size={20} />
              </span>
              <span className="min-w-0 flex-1">
                {d ? (
                  <a href={`/paath/${b.slug}`} className="block truncate text-[16px] font-bold text-ink hover:underline">{b.short}</a>
                ) : (
                  <span className="block truncate text-[16px] font-bold text-ink">{b.short}</span>
                )}
                <span className="block text-caption text-ink-2">
                  {saving ? `Saving… ${Math.round(pct * 100)}%` : d ? `Saved · ${fmtBytes(d.bytes)}${d.audio ? " · with audio" : ""}` : b.detail}
                </span>
              </span>
              {d ? (
                <Button size="sm" variant="ghost" onClick={() => removeBani(b.slug)} aria-label={`Remove ${b.short} from this device`}>Remove</Button>
              ) : (
                <Button size="sm" variant="secondary" loading={saving} disabled={!!busy && !saving} onClick={() => save(b.slug)} aria-label={`Save ${b.short} for offline`}>Save</Button>
              )}
            </li>
          );
        })}
      </ul>
      {error && <p role="alert" className="text-caption text-error">{error}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-sunken px-4 py-3 text-[14px] text-ink-2">
        <span>
          {downloads.length ? `${downloads.length} saved · ${fmtBytes(total)}` : "Nothing saved yet"}
          {quota && quota.quota > 0 && ` · device space used by the app ${fmtBytes(quota.usage)}`}
        </span>
        {downloads.length > 0 && <Button size="sm" variant="ghost" onClick={() => setAskAll(true)}>Remove all</Button>}
      </div>
      <ConfirmDialog
        open={askAll}
        onClose={() => setAskAll(false)}
        onConfirm={() => {
          setAskAll(false);
          void removeAll();
        }}
        title="Remove all downloads?"
        body="Saved banis will need internet again. Bookmarks and favourites stay."
        confirmLabel="Remove all"
      />
    </div>
  );
}
