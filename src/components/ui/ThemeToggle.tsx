"use client";
// Header sun/moon button: switches light ⇄ dark (saved in prefs, synced like Settings → Theme).
// Icons swap via CSS (dark: variant) so server and client markup match.
import { Icon } from "@/components/icons";
import { writePrefs } from "@/lib/prefs";
import { cn } from "@/lib/cn";

function isDark() {
  const t = document.documentElement.dataset.theme;
  if (t) return t === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeToggle({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => writePrefs({ theme: isDark() ? "light" : "dark" })}
      aria-label="Switch light or dark theme"
      title="Light / dark theme"
      className={cn("grid size-11 shrink-0 place-items-center rounded-md text-ink-2 hover:bg-sunken hover:text-ink", className)}
    >
      <Icon name="moon" className="dark:hidden" />
      <Icon name="sun" className="hidden dark:block" />
    </button>
  );
}
