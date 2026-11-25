"use client";
// N.0.3 — Responsive app shell (U.8): bottom tabs <600 · rail 80 (600–1023) · side nav 220 (1024–1279) / 256 (≥1280). Content max 1200.
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/icons";
import { Logo } from "@/components/Logo";

export const appTabs: { href: string; label: string; gurmukhi: string; icon: IconName }[] = [
  { href: "/paath", label: "Paath", gurmukhi: "ਪਾਠ", icon: "book" },
  { href: "/learn", label: "Learn", gurmukhi: "ਸਿੱਖੋ", icon: "letter" },
  { href: "/culture", label: "Culture", gurmukhi: "ਵਿਰਸਾ", icon: "culture" },
  { href: "/parent", label: "Parent", gurmukhi: "ਮਾਪੇ", icon: "parent" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const isActive = (href: string) => path === href || path.startsWith(`${href}/`);

  return (
    <div className="flex min-h-dvh bg-app">
      {/* Rail (tab) / Side nav (web) */}
      <nav
        aria-label="Main"
        className="sticky top-0 hidden h-dvh w-20 shrink-0 flex-col items-center gap-2 border-r border-line bg-surface py-4 tab:flex web:w-[220px] web:items-stretch web:px-3 wide:w-[256px]"
      >
        <Link href="/" className="mb-4 flex items-center gap-2 web:px-3" aria-label="Gurmukhi Virsa home">
          <span className="web:hidden"><Logo compact /></span>
          <span className="hidden web:block"><Logo /></span>
        </Link>
        {appTabs.map((t) => {
          const on = isActive(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={on ? "page" : undefined}
              className={cn(
                "flex w-16 flex-col items-center gap-1 rounded-lg py-2 text-[12px] font-extrabold web:w-auto web:flex-row web:gap-3 web:px-3 web:py-3 web:text-[16px]",
                on ? "bg-brand-soft text-brand-text" : "text-ink-2 hover:bg-sunken hover:text-ink",
              )}
            >
              <Icon name={t.icon} size={24} />
              <span>{t.label}</span>
            </Link>
          );
        })}
        <div className="mt-auto" />
        <Link
          href="/settings"
          aria-current={isActive("/settings") ? "page" : undefined}
          className={cn(
            "flex w-16 flex-col items-center gap-1 rounded-lg py-2 text-[12px] font-extrabold web:w-auto web:flex-row web:gap-3 web:px-3 web:text-[16px]",
            isActive("/settings") ? "bg-brand-soft text-brand-text" : "text-ink-2 hover:bg-sunken",
          )}
        >
          <Icon name="settings" size={24} />
          <span>Settings</span>
        </Link>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col pb-[84px] tab:pb-0">
        <main id="main" className="mx-auto w-full max-w-[1200px] flex-1">
          {children}
        </main>
      </div>

      {/* Bottom tab bar (mobile) */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 flex h-[84px] items-start justify-around border-t border-line bg-surface px-2 pt-2 pb-[env(safe-area-inset-bottom)] tab:hidden"
      >
        {appTabs.map((t) => {
          const on = isActive(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={on ? "page" : undefined}
              className={cn("flex flex-1 flex-col items-center gap-1 text-[12px] font-extrabold", on ? "text-brand-text" : "text-ink-2")}
            >
              <span className={cn("grid h-8 w-14 place-items-center rounded-full", on && "bg-brand-soft")}>
                <Icon name={t.icon} size={24} />
              </span>
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
