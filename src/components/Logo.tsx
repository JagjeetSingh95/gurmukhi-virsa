import { cn } from "@/lib/cn";

/** Wordmark: saffron letter tile (ੳ) + name. Never use ੴ or Gurbani as decoration. */
export function Logo({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className="grid size-10 place-items-center rounded-md bg-brand font-[family-name:var(--font-gurmukhi)] text-[24px] font-bold leading-none text-white shadow-[0_3px_0_var(--brand-shadow)]"
      >
        ੳ
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="whitespace-nowrap text-[18px] font-black text-ink">Gurmukhi Virsa</span>
          <span className="font-[family-name:var(--font-gurmukhi)] text-[13px] font-bold text-brand-text">ਗੁਰਮੁਖੀ ਵਿਰਸਾ</span>
        </span>
      )}
    </span>
  );
}
