// W.6 404
import { Sheru } from "@/components/sheru/Sheru";
import { ButtonLink } from "@/components/ui/controls";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-20 text-center">
        <Sheru mood="oops" size={160} />
        <p className="text-label uppercase tracking-[0.12em] text-brand-text">Error 404</p>
        <h1 className="text-h1">Oops — this page wandered off</h1>
        <p className="max-w-md text-body-l text-ink-2">Sheru looked everywhere but couldn&apos;t find it. Let&apos;s get you back on the path.</p>
        <div className="flex flex-col gap-3 tab:flex-row">
          <ButtonLink href="/">Go home</ButtonLink>
          <ButtonLink href="/paath" variant="secondary">Open web app</ButtonLink>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
