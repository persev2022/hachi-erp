"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <Card className="w-full max-w-md shadow-xl border-border/50">
      <CardHeader className="text-center space-y-4 pb-2">
        {/* Logo */}
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/hachi-logo.svg" alt="Hachi" className="h-16 w-16" />
        </div>
        <div>
          <CardTitle className="text-2xl">Hachi ERP</CardTitle>
          <CardDescription className="mt-1">
            Sistema de gestão para clínicas de reabilitação
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Email
            </label>
            <Input type="email" placeholder="seu@email.com" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Senha
            </label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full mt-2">
            Entrar
          </Button>
        </form>
        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2025 Hachi — Todos os direitos reservados
        </p>
      </CardContent>
    </Card>
  );
}
