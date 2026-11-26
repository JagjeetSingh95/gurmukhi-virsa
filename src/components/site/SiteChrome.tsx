import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/icons";
import { marketingNav, site } from "@/lib/site";
import { HeaderCta } from "@/components/site/VisitorCta";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-app/90 backdrop-blur">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2">
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-5 web:h-[72px] web:px-8">
        <Link href="/" aria-label={`${site.name} home`}>
          <Logo />
        </Link>
        <nav aria-label="Primary" className="ml-auto hidden items-center gap-1 web:flex">
          {marketingNav.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-md px-3 py-2 text-[15px] font-bold text-ink-2 hover:bg-sunken hover:text-ink">
              {n.label}
            </Link>
          ))}
        </nav>
        <span className="ml-auto hidden tab:block web:ml-2">
          <HeaderCta />
        </span>
        {/* Mobile / tablet menu — no JS needed */}
        <details className="group relative ml-auto tab:ml-0 web:hidden">
          <summary className="grid size-11 cursor-pointer list-none place-items-center rounded-md hover:bg-sunken [&::-webkit-details-marker]:hidden" aria-label="Menu">
            <Icon name="menu" className="group-open:hidden" />
            <Icon name="close" className="hidden group-open:block" />
          </summary>
          <div className="absolute right-0 top-13 w-64 rounded-xl border border-line bg-surface p-2 shadow-xl">
            {marketingNav.map((n) => (
              <Link key={n.href} href={n.href} className="block rounded-md px-4 py-3 text-[16px] font-bold hover:bg-sunken">
                {n.label}
              </Link>
            ))}
            <Link href="/download" className="block rounded-md px-4 py-3 text-[16px] font-bold hover:bg-sunken">
              Get the app
            </Link>
            <HeaderCta mobile />
          </div>
        </details>
      </div>
    </header>
  );
}

const footerCols = [
  { title: "Product", links: [["Features", "/features"], ["Pricing", "/pricing"], ["Get the app", "/download"], ["Start free", "/welcome"]] },
  { title: "Company", links: [["About", "/about"], ["Contact", "/contact"]] },
  { title: "Help", links: [["Help centre", "/support"], ["Privacy", "/privacy"], ["Terms", "/terms"]] },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-12 tab:grid-cols-2 web:grid-cols-[1.4fr_1fr_1fr_1fr] web:px-8">
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="max-w-xs text-[15px] text-ink-2">{site.tagline} No ads. No tracking.</p>
        </div>
        {footerCols.map((c) => (
          <nav key={c.title} aria-label={c.title} className="flex flex-col gap-2">
            <h2 className="text-label uppercase tracking-wider text-ink-3">{c.title}</h2>
            {c.links.map(([label, href]) => (
              <Link key={href} href={href} className="text-[15px] font-bold text-ink-2 hover:text-brand-text">
                {label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-[1200px] px-5 py-5 text-caption text-ink-3 web:px-8">
          © 2026 {site.name} · {site.nameGurmukhi}
        </p>
      </div>
    </footer>
  );
}
