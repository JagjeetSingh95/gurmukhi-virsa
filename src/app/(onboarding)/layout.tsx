import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ToastProvider } from "@/components/ui/feedback";
import { AuthProvider } from "@/lib/auth";

export default function OnboardingLayout({ children }: LayoutProps<"/">) {
  return (
    <AuthProvider eager>
      <ToastProvider>
        <div className="flex min-h-dvh flex-col bg-gradient-to-b from-saffron-50 to-app dark:from-sunken">
          <header className="mx-auto flex h-16 w-full max-w-[1200px] items-center px-5 web:px-8">
            <Link href="/" aria-label="Gurmukhi Virsa home">
              <Logo />
            </Link>
          </header>
          <main id="main" className="mx-auto flex w-full max-w-[560px] flex-1 flex-col px-5 pb-12 pt-4">
            {children}
          </main>
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}
