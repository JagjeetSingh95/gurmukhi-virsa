"use client";
// N.9.3 Error boundary (U09): calm message + retry. No technical details shown to families.
import { useEffect } from "react";
import { StateView } from "@/components/ui/feedback";
import { Button, ButtonLink } from "@/components/ui/controls";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main id="main" className="flex min-h-[70dvh] flex-1 items-center justify-center bg-app">
      <StateView
        kind="error"
        title="Something went wrong"
        body="Sorry — this screen didn't load. Your progress is safe. Try again, or go back to Paath."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={() => retry()}>Try again</Button>
            <ButtonLink href="/paath" variant="ghost">Go to Paath</ButtonLink>
          </div>
        }
      />
    </main>
  );
}
