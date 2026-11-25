"use client";
// N.1.3 — Sheet/Modal, Dialog, Toast, Empty / Skeleton / Error / Offline states, Quiz tile. Canvas U07c / U09.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/icons";
import { Sheru, type SheruMood } from "@/components/sheru/Sheru";
import { Button } from "./controls";

/** Bottom sheet on mobile, centred modal ≥600. Native <dialog>: focus trap + Esc for free. */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={title}
      className={cn(
        "m-0 mt-auto w-full max-w-none rounded-t-2xl bg-surface p-0 text-ink backdrop:bg-black/40",
        "tab:m-auto tab:max-w-[480px] tab:rounded-2xl open:animate-pop",
      )}
    >
      <div className="flex flex-col gap-4 p-6">
        <div className="mx-auto h-1.5 w-10 rounded-full bg-line-strong tab:hidden" aria-hidden />
        <div className="flex items-start gap-3">
          <h2 className="flex-1 text-h3">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full hover:bg-sunken">
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="text-body text-ink-2">{children}</div>
        {footer && <div className="flex flex-col gap-3 tab:flex-row-reverse">{footer}</div>}
      </div>
    </dialog>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel = "Confirm",
  destructive,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: string;
  confirmLabel?: string;
  destructive?: boolean;
}) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button
            variant={destructive ? "navy" : "primary"}
            className={destructive ? "!bg-[var(--red-600)] !shadow-[0_4px_0_var(--red-800)]" : undefined}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </>
      }
    >
      {body}
    </Sheet>
  );
}

type ToastItem = { id: number; text: string; tone: "info" | "success" | "error" };
const ToastCtx = createContext<(text: string, tone?: ToastItem["tone"]) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((text: string, tone: ToastItem["tone"] = "info") => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, text, tone }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 3500);
  }, []);
  const icon: Record<ToastItem["tone"], IconName> = { info: "info", success: "check", error: "alert" };
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[164px] z-50 flex flex-col items-center gap-2 px-4 tab:bottom-24">
        {items.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex animate-pop items-center gap-2 rounded-full bg-inverse px-5 py-3 text-[15px] font-bold text-ink-inverse shadow-lg"
          >
            <Icon name={icon[t.tone]} size={18} />
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function StateView({
  kind,
  title,
  body,
  action,
  art = true,
}: {
  art?: boolean; // false in Paath areas — no mascot near Gurbani (D.4)
  kind: "empty" | "error" | "offline";
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  const mood: Record<typeof kind, SheruMood> = { empty: "think", error: "oops", offline: "sleepy" };
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      {kind === "offline" || !art ? (
        <span className="grid size-24 place-items-center rounded-full bg-sunken text-ink-2">
          <Icon name={kind === "offline" ? "wifi-off" : kind === "error" ? "alert" : "search"} size={40} />
        </span>
      ) : (
        <Sheru mood={mood[kind]} size={96} decorative />
      )}
      <h2 className="text-h3 text-ink">{title}</h2>
      {body && <p className="max-w-sm text-body text-ink-2">{body}</p>}
      {action}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden className={cn("block animate-pulse rounded-md bg-sunken", className)} />;
}

export function QuizTile({
  label,
  index,
  state = "idle",
  onClick,
  gurmukhi,
}: {
  label: string;
  index: number;
  state?: "idle" | "selected" | "correct" | "wrong";
  onClick?: () => void;
  gurmukhi?: boolean;
}) {
  const styles = {
    idle: "border-line-strong bg-surface shadow-[0_4px_0_var(--border-strong)]",
    selected: "border-navy-600 bg-navy-50 shadow-[0_4px_0_var(--navy-600)] dark:bg-navy-900",
    correct: "border-[var(--green-600)] bg-success-bg shadow-[0_4px_0_var(--green-800)]",
    wrong: "border-[var(--red-600)] bg-error-bg shadow-[0_4px_0_var(--red-800)]",
  }[state];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={state === "selected"}
      className={cn(
        "relative grid min-h-24 place-items-center rounded-xl border-2 p-4 transition-transform active:translate-y-[3px] active:shadow-none",
        styles,
      )}
    >
      <span className="absolute left-2.5 top-2 text-caption text-ink-3">{index}</span>
      <span className={gurmukhi ? "font-[family-name:var(--font-gurmukhi)] text-[44px] font-bold text-ink" : "text-[18px] font-extrabold text-ink"}>
        {label}
      </span>
      {(state === "correct" || state === "wrong") && (
        <span className={cn("absolute right-2.5 top-2", state === "correct" ? "text-success" : "text-error")}>
          <Icon name={state === "correct" ? "check" : "close"} size={20} />
          <span className="sr-only">{state === "correct" ? "Correct" : "Not quite"}</span>
        </span>
      )}
    </button>
  );
}
