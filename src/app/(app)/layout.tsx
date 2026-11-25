import { AppShell } from "@/components/shell/AppShell";
import { ToastProvider } from "@/components/ui/feedback";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <ToastProvider>
      <AppShell>{children}</AppShell>
    </ToastProvider>
  );
}
