"use client";
// Parent sub-pages: back bar + parent gate (5-minute unlock carries over between pages).
import Link from "next/link";
import type { ReactNode } from "react";
import { GatedPage } from "@/components/gate/ParentGate";
import { Icon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/controls";
import { TopBar } from "@/components/ui/display";
import { useAuth } from "@/lib/auth";

export function ParentShell({ title, back = "/parent", children }: { title: string; back?: string; children: ReactNode }) {
  const { ready, session } = useAuth();
  return (
    <>
      <TopBar
        title={title}
        leading={
          <Link href={back} aria-label="Back" className="-ml-2 grid size-11 place-items-center rounded-full text-ink-2 hover:bg-sunken">
            <Icon name="arrow-left" />
          </Link>
        }
      />
      {!ready ? null : !session ? (
        <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
          <p className="text-body text-ink-2">Sign in as a parent to see this page.</p>
          <ButtonLink href="/signin">Parent sign-in</ButtonLink>
        </div>
      ) : (
        <GatedPage>
          <div className="mx-auto flex w-full max-w-[880px] flex-col gap-5 px-5 py-6 web:px-8">{children}</div>
        </GatedPage>
      )}
    </>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-label text-ink-2">{label}</legend>
      {children}
      {hint && <p className="text-caption text-ink-3">{hint}</p>}
    </fieldset>
  );
}
