"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function PortalFamiliaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/portal-familia";

  const handleLogout = () => {
    localStorage.removeItem("family-token");
    localStorage.removeItem("family-paciente");
    router.push("/portal-familia");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hachi-logo.png"
              alt="Hachi"
              className="h-8 w-8 rounded object-contain"
            />
            <span className="font-semibold text-lg text-gray-800">
              Portal da Família
            </span>
          </div>
          {!isLoginPage && (
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          )}
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
      <footer className="border-t bg-white mt-8">
        <div className="max-w-4xl mx-auto px-4 py-4 text-center text-xs text-muted-foreground">
          © 2025 Hachi — Portal da Família
        </div>
      </footer>
    </div>
  );
}
