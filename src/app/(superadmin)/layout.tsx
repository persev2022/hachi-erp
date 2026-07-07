import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast-simple";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </ThemeProvider>
  );
}
