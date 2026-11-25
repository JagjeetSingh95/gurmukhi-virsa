"use client";
// N.0.3 — Responsive app shell (U.8): bottom tabs <600 · rail 80 (600–1023) · side nav 220 (1024–1279) / 256 (≥1280). Content max 1200.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { avatarEmoji } from "@/lib/avatars";
import { local } from "@/lib/local";
import { useLocal } from "@/lib/useLocal";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/icons";
import { Logo } from "@/components/Logo";

export const appTabs: { href: string; label: string; gurmukhi: string; icon: IconName }[] = [
  { href: "/paath", label: "Paath", gurmukhi: "ਪਾਠ", icon: "book" },
  { href: "/learn", label: "Learn", gurmukhi: "ਸਿੱਖੋ", icon: "letter" },
  { href: "/culture", label: "Culture", gurmukhi: "ਵਿਰਸਾ", icon: "culture" },
  { href: "/parent", label: "Parent", gurmukhi: "ਮਾਪੇ", icon: "parent" },
];

const adultTabs = [appTabs[0], appTabs[2], { href: "/settings", label: "Settings", gurmukhi: "ਸੈਟਿੰਗ", icon: "settings" as IconName }];

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { session, kids } = useAuth();
  const mode = useLocal(local.mode, null);
  const activeId = useLocal(local.activeChild, null);
  const child = kids.find((k) => k.id === activeId);
  // Adult guest (or no choice yet) = Paath · Culture · Settings. Family = 4 tabs.
  const family = mode === "family" && !!session;
  const tabs = family ? appTabs : adultTabs;

  useEffect(() => {
    try {
      if (!sessionStorage.getItem("gv.counted")) {
        sessionStorage.setItem("gv.counted", "1");
        local.bumpSession();
      }
    } catch {}
  }, []);
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
        {child && (
          <Link href="/profiles" className="mb-2 flex w-16 flex-col items-center gap-1 rounded-lg py-2 text-[12px] font-extrabold text-ink hover:bg-sunken web:w-auto web:flex-row web:gap-3 web:px-3 web:text-[15px]" aria-label={`${child.name} — switch profile`}>
            <span className="grid size-9 place-items-center rounded-full bg-brand-soft text-[20px]">{avatarEmoji(child.avatar)}</span>
            <span className="truncate">{child.name}</span>
          </Link>
        )}
        {tabs.filter((t) => t.href !== "/settings").map((t) => {
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
        {tabs.map((t) => {
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
