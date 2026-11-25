// N.1.2 — Card, List row, Top bar, Profile tile, Progress, Badge / Lock tag. Canvas U07b / D03.
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/icons";

export function Card({ className, interactive, ...rest }: ComponentProps<"div"> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-line bg-surface p-5 shadow-[0_2px_0_var(--border-default)]",
        interactive && "transition-transform hover:-translate-y-0.5",
        className,
      )}
      {...rest}
    />
  );
}

export function ListRow({
  icon,
  title,
  subtitle,
  trailing,
  href,
  onClick,
  value,
  className,
}: {
  icon?: IconName;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  href?: string;
  /** Renders a button row (e.g. opens the parent gate). */
  onClick?: () => void;
  /** Short value shown before the arrow (e.g. current plan). */
  value?: string;
  className?: string;
}) {
  const inner = (
    <>
      {icon && (
        <span className="grid size-10 shrink-0 place-items-center rounded-md bg-brand-soft text-brand-text">
          <Icon name={icon} size={20} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[16px] font-bold text-ink">{title}</span>
        {subtitle && <span className="block truncate text-caption text-ink-2">{subtitle}</span>}
      </span>
      {value && <span className="shrink-0 text-[14px] font-bold text-ink-2">{value}</span>}
      {trailing ?? ((href || onClick) && <Icon name="arrow-right" size={18} className="text-ink-3" />)}
    </>
  );
  const cls = cn("flex min-h-[var(--row-h)] items-center gap-3 px-4 py-2", className);
  if (onClick)
    return (
      <button type="button" onClick={onClick} className={cn(cls, "self-stretch rounded-md text-left hover:bg-sunken")}>
        {inner}
      </button>
    );
  return href ? (
    <Link href={href} className={cn(cls, "rounded-md hover:bg-sunken")}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

export function TopBar({ title, leading, trailing }: { title: string; leading?: ReactNode; trailing?: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-line bg-app/90 px-4 backdrop-blur web:h-16 web:px-8">
      {leading}
      <h1 className="flex-1 truncate text-h3 text-ink">{title}</h1>
      {trailing}
    </header>
  );
}

const avatarBg = ["#FFE7CC", "#E6E9F6", "#DDF3E6", "#FFF1C7", "#E0EEFA", "#FBE3E3"];

export function ProfileTile({
  name,
  emoji,
  colorIndex = 0,
  selected,
  onClick,
}: {
  name: string;
  emoji: string;
  colorIndex?: number;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="group flex flex-col items-center gap-2">
      <span
        className={cn(
          "grid size-[84px] place-items-center rounded-2xl text-[40px] transition-transform group-hover:scale-105 tab:size-[112px] tab:text-[52px]",
          selected && "ring-4 ring-brand ring-offset-2 ring-offset-app",
        )}
        style={{ background: avatarBg[colorIndex % avatarBg.length] }}
        aria-hidden
      >
        {emoji}
      </span>
      <span className="text-[16px] font-extrabold text-ink">{name}</span>
    </button>
  );
}

export function Progress({
  value,
  label,
  tone = "brand",
  className,
}: {
  value: number;
  label: string;
  tone?: "brand" | "success";
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v)}
      className={cn("h-2.5 overflow-hidden rounded-full bg-sunken", className)}
    >
      <span
        className={cn("block h-full rounded-full", tone === "success" ? "bg-green" : "bg-brand")}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

type Tone = "brand" | "navy" | "success" | "error" | "reward" | "info";
const tones: Record<Tone, string> = {
  brand: "bg-brand-soft text-brand-text",
  navy: "bg-navy-50 text-navy-800 dark:bg-navy-900 dark:text-navy-50",
  success: "bg-success-bg text-success",
  error: "bg-error-bg text-error",
  reward: "bg-reward-bg text-reward",
  info: "bg-info-bg text-info",
};

export function Badge({ tone = "brand", icon, children, className }: { tone?: Tone; icon?: IconName; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-extrabold", tones[tone], className)}>
      {icon && <Icon name={icon} size={13} />}
      {children}
    </span>
  );
}

export function LockTag({ label = "Family" }: { label?: string }) {
  return (
    <Badge tone="reward" icon="lock">
      {label}
    </Badge>
  );
}
