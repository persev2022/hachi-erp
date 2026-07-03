"use client";

import * as React from "react";
import { Sidebar, MobileHeader } from "@/components/layout/sidebar";
import { ToastProvider } from "@/components/ui/toast-simple";
import { ThemeProvider } from "@/components/theme-provider";
import { CommandSearch } from "@/components/command-search";
import { SessionTimeout } from "@/components/session-timeout";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="lg:pl-64">
            <div className="px-4 pt-4 md:px-8 md:pt-6">
              <Breadcrumb />
            </div>
            {children}
          </main>
        </div>
        <CommandSearch />
        <SessionTimeout />
      </ToastProvider>
    </ThemeProvider>
  );
}
