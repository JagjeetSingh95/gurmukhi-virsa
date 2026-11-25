"use client";
// N.1.1 — Button, Chip, Input (text/email/PIN/code), Toggle, Segmented.
// States: :focus-visible ring (globals), loading (width kept), error, disabled. Canvas U07a / D03.
import Link from "next/link";
import { useId, useRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/icons";

type Variant = "primary" | "secondary" | "navy" | "success" | "ghost";
type Size = "md" | "sm";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white shadow-[0_4px_0_var(--brand-shadow)] hover:brightness-105",
  secondary: "bg-surface text-brand-text border-2 border-line-strong shadow-[0_4px_0_var(--border-strong)]",
  navy: "bg-navy-800 text-white shadow-[0_4px_0_var(--navy-900)] dark:bg-navy-600",
  success: "bg-green text-white shadow-[0_4px_0_var(--green-800)]",
  ghost: "bg-transparent text-brand-text shadow-none hover:bg-brand-soft",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  block,
  className,
}: { variant?: Variant; size?: Size; block?: boolean; className?: string } = {}) {
  return cn(
    "relative inline-flex select-none items-center justify-center gap-2 font-extrabold transition-[transform,box-shadow,filter]",
    "active:translate-y-[3px] active:shadow-none",
    "disabled:pointer-events-none disabled:bg-[#E9DFD2] disabled:text-ink-3 disabled:shadow-none aria-disabled:pointer-events-none aria-disabled:opacity-60",
    size === "md"
      ? "h-[var(--control-h)] rounded-lg px-6 text-[16px] web:rounded-md"
      : "h-10 rounded-md px-4 text-[14px]",
    block && "w-full",
    variants[variant],
    className,
  );
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  loading?: boolean;
  icon?: ReactNode;
};

export function Button({ variant, size, block, loading, icon, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      className={buttonClasses({ variant, size, block, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      <span className={cn("inline-flex items-center gap-2", loading && "invisible")}>
        {icon}
        {children}
      </span>
      {loading && (
        <span className="absolute inset-0 grid place-items-center" aria-hidden>
          <span className="size-5 animate-spin rounded-full border-[3px] border-current border-r-transparent" />
        </span>
      )}
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  block,
  className,
  ...rest
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size; block?: boolean }) {
  return <Link className={buttonClasses({ variant, size, block, className })} {...rest} />;
}

export function Chip({
  selected,
  className,
  children,
  ...rest
}: ComponentProps<"button"> & { selected?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex h-[var(--chip-h)] items-center gap-1.5 rounded-full px-4 text-[14px] font-bold transition-colors",
        selected
          ? "bg-navy-800 text-white dark:bg-navy-300 dark:text-navy-900"
          : "border-[1.5px] border-line-strong bg-surface text-ink hover:border-navy-300",
        className,
      )}
      {...rest}
    >
      {selected && <Icon name="check" size={16} />}
      {children}
    </button>
  );
}

type FieldProps = ComponentProps<"input"> & { label: string; hint?: string; error?: string };

export function Input({ label, hint, error, className, id, ...rest }: FieldProps) {
  const autoId = useId();
  const fid = id ?? autoId;
  const desc = error ? `${fid}-err` : hint ? `${fid}-hint` : undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={fid} className="text-label text-ink">
        {label}
      </label>
      <input
        id={fid}
        aria-invalid={!!error || undefined}
        aria-describedby={desc}
        className={cn(
          "h-[var(--control-h)] rounded-lg border-2 bg-surface px-4 text-[16px] font-semibold text-ink outline-none web:rounded-md",
          "placeholder:text-ink-3 focus-visible:border-navy-600 disabled:bg-sunken disabled:text-ink-3",
          error ? "border-[var(--red-600)]" : "border-line-strong",
        )}
        {...rest}
      />
      {error ? (
        <p id={desc} className="flex items-center gap-1 text-caption text-error">
          <Icon name="alert" size={14} /> {error}
        </p>
      ) : hint ? (
        <p id={desc} className="text-caption text-ink-2">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** PIN (4) or sign-in / family code (6) — one box per digit. */
export function CodeInput({
  length = 6,
  label,
  value,
  onChange,
  error,
  secret,
}: {
  length?: 4 | 6;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  secret?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const gid = useId();
  const set = (i: number, ch: string) => {
    const digits = value.padEnd(length, " ").split("");
    digits[i] = ch || " ";
    onChange(digits.join("").trimEnd());
  };
  return (
    <fieldset className="flex flex-col gap-1.5" aria-describedby={error ? `${gid}-err` : undefined}>
      <legend className="mb-1.5 text-label text-ink">{label}</legend>
      <div className="flex gap-2">
        {Array.from({ length }, (_, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            type={secret ? "password" : "text"}
            maxLength={1}
            aria-label={`Digit ${i + 1} of ${length}`}
            value={value[i]?.trim() ?? ""}
            onChange={(e) => {
              const ch = e.target.value.replace(/\D/g, "").slice(-1);
              set(i, ch);
              if (ch) refs.current[i + 1]?.focus();
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !value[i]?.trim()) refs.current[i - 1]?.focus();
            }}
            onPaste={(e) => {
              const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
              if (p) {
                e.preventDefault();
                onChange(p);
                refs.current[Math.min(p.length, length - 1)]?.focus();
              }
            }}
            className={cn(
              "h-14 w-12 rounded-md border-2 bg-surface text-center text-[24px] font-extrabold text-ink outline-none focus-visible:border-navy-600",
              error ? "border-[var(--red-600)]" : "border-line-strong",
            )}
          />
        ))}
      </div>
      {error && (
        <p id={`${gid}-err`} className="text-caption text-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-8 w-[52px] shrink-0 rounded-full transition-colors disabled:opacity-50",
        checked ? "bg-green" : "bg-line-strong",
      )}
    >
      <span
        className={cn(
          "absolute top-1 size-6 rounded-full bg-white shadow transition-[left]",
          checked ? "left-[24px]" : "left-1",
        )}
      />
    </button>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full bg-sunken p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn(
            "h-[calc(var(--segment-h)-8px)] rounded-full px-4 text-[14px] font-bold transition-colors",
            o.value === value ? "bg-surface text-brand-text shadow-sm" : "text-ink-2 hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
