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
import { Heart } from "lucide-react";

export default function PortalFamiliaLoginPage() {
  const router = useRouter();
  const [token, setToken] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // Check if already authenticated
  React.useEffect(() => {
    const storedToken = localStorage.getItem("family-token");
    if (storedToken) {
      router.push("/portal-familia/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token.trim()) {
      setError("Por favor, insira o token de acesso");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/portal-familia/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Token inválido");
        return;
      }

      // Store token and patient info
      const cleanToken = token.replace(/[-\s]/g, "");
      localStorage.setItem("family-token", cleanToken);
      localStorage.setItem("family-paciente", JSON.stringify(data.paciente));
      router.push("/portal-familia/dashboard");
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">Portal da Família</CardTitle>
            <CardDescription className="mt-2">
              Acompanhe o tratamento do seu familiar com segurança e
              transparência. Insira o token de acesso fornecido pela clínica.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Token de Acesso
              </label>
              <Input
                type="text"
                placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={loading}
                autoComplete="off"
                className="font-mono text-center"
              />
              <p className="text-xs text-muted-foreground">
                O token foi fornecido pela secretaria da clínica
              </p>
            </div>
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? "Verificando..." : "Acessar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
