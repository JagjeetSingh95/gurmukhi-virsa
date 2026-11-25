import { AppShell } from "@/components/shell/AppShell";
import { ToastProvider } from "@/components/ui/feedback";
import { AuthProvider } from "@/lib/auth";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppShell>{children}</AppShell>
      </ToastProvider>
    </AuthProvider>
  );
}
