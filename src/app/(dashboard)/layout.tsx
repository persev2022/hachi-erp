"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { ToastProvider } from "@/components/ui/toast-simple";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen">
        <Sidebar />
        <main className="pl-64">{children}</main>
      </div>
    </ToastProvider>
  );
}
