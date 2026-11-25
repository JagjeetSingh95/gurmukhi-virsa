"use client";
// Reading settings (D07): text size, scripts, mode, audio speed, repeat, bedtime timer, dark mode.
import { useState } from "react";
import { Button, Segmented, Toggle } from "@/components/ui/controls";
import { Sheet } from "@/components/ui/feedback";
import { writeReaderMode, type ReaderMode } from "./recent";
import { writeSettings, type ReaderSettings } from "./settings";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-t border-line pt-4 first:border-0 first:pt-0">
      <span className="text-label text-ink">{label}</span>
      {children}
    </div>
  );
}

export function ReaderSettingsSheet({
  open,
  onClose,
  settings,
  mode,
  hasAudio,
}: {
  open: boolean;
  onClose: () => void;
  settings: ReaderSettings;
  mode: ReaderMode;
  hasAudio: boolean;
}) {
  const [dark, setDark] = useState(() => typeof document !== "undefined" && document.documentElement.dataset.theme === "dark");
  const set = writeSettings;
  return (
    <Sheet open={open} onClose={onClose} title="Reading settings" footer={<Button onClick={onClose}>Done</Button>}>
      <div className="flex max-h-[60dvh] flex-col gap-4 overflow-y-auto pr-1 text-ink">
        <Row label="Mode">
          <Segmented<ReaderMode>
            label="Mode"
            value={mode}
            onChange={writeReaderMode}
            options={[
              { value: "adult", label: "Adult" },
              { value: "kids", label: "Kids" },
            ]}
          />
          {mode === "kids" && (
            <Segmented
              label="Kids view"
              value={settings.kidsView}
              onChange={(v) => set({ kidsView: v })}
              options={[
                { value: "scroll", label: "Scroll" },
                { value: "line", label: "Line by line" },
              ]}
            />
          )}
        </Row>
        <Row label="Text size">
          <div className="flex items-center gap-3" role="group" aria-label="Text size">
            <Button size="sm" variant="secondary" aria-label="Smaller text" disabled={settings.size === 0} onClick={() => set({ size: (settings.size - 1) as ReaderSettings["size"] })}>
              A−
            </Button>
            <div className="flex flex-1 gap-1.5" aria-hidden>
              {[0, 1, 2, 3].map((n) => (
                <span key={n} className={`h-2 flex-1 rounded-full ${n <= settings.size ? "bg-brand" : "bg-sunken"}`} />
              ))}
            </div>
            <Button size="sm" variant="secondary" aria-label="Bigger text" disabled={settings.size === 3} onClick={() => set({ size: (settings.size + 1) as ReaderSettings["size"] })}>
              A+
            </Button>
          </div>
        </Row>
        <Row label="Show">
          <div className="flex flex-col gap-3 text-[15px] font-bold">
            <span className="flex items-center justify-between">Gurmukhi <span className="text-caption text-ink-3">Always on</span></span>
            <label className="flex items-center justify-between">Roman <Toggle label="Roman" checked={settings.roman} onChange={(v) => set({ roman: v })} /></label>
            <label className="flex items-center justify-between">English meaning <Toggle label="English meaning" checked={settings.en} onChange={(v) => set({ en: v })} /></label>
            <label className="flex items-center justify-between">Punjabi meaning <Toggle label="Punjabi meaning" checked={settings.pa} onChange={(v) => set({ pa: v })} /></label>
          </div>
        </Row>
        <Row label={hasAudio ? "Audio speed" : "Audio speed · audio coming soon"}>
          <Segmented
            label="Audio speed"
            value={String(settings.speed) as "0.75" | "1" | "1.25" | "1.5"}
            onChange={(v) => set({ speed: Number(v) as ReaderSettings["speed"] })}
            options={[
              { value: "0.75", label: "0.75×" },
              { value: "1", label: "1×" },
              { value: "1.25", label: "1.25×" },
              { value: "1.5", label: "1.5×" },
            ]}
          />
        </Row>
        <Row label="Repeat">
          <Segmented
            label="Repeat"
            value={settings.repeat}
            onChange={(v) => set({ repeat: v })}
            options={[
              { value: "off", label: "Off" },
              { value: "line", label: "Line" },
              { value: "section", label: "Pauri" },
              { value: "bani", label: "Bani" },
            ]}
          />
        </Row>
        <Row label="Bedtime timer">
          <Segmented
            label="Bedtime timer"
            value={settings.timer}
            onChange={(v) => set({ timer: v })}
            options={[
              { value: "off", label: "Off" },
              { value: "15", label: "15 min" },
              { value: "30", label: "30 min" },
              { value: "end", label: "End" },
            ]}
          />
        </Row>
        <Row label="Appearance">
          <label className="flex items-center justify-between text-[15px] font-bold">
            Dark mode
            <Toggle
              label="Dark mode"
              checked={dark}
              onChange={(v) => {
                setDark(v);
                document.documentElement.dataset.theme = v ? "dark" : "light";
              }}
            />
          </label>
        </Row>
      </div>
    </Sheet>
  );
}
