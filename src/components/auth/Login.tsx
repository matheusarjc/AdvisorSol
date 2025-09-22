import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { TrendingUp, Moon, Sun } from "lucide-react";

interface LoginProps {
  onLogin: (email: string, password: string) => void | Promise<void>;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Login({ onLogin, darkMode, onToggleDarkMode }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError(null);

    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleDarkMode}
        className="absolute top-4 right-4"
        aria-label={darkMode ? "Ativar modo claro" : "Ativar modo escuro"}
        title={darkMode ? "Ativar modo claro" : "Ativar modo escuro"}>
        {darkMode ? (
          <Sun className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Moon className="h-4 w-4" aria-hidden="true" />
        )}
      </Button>

      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div
            className="mx-auto bg-primary p-3 rounded-lg w-fit mb-4"
            role="img"
            aria-label="Logo AdvisorSol">
            <TrendingUp className="h-8 w-8 text-primary-foreground" aria-hidden="true" />
          </div>
          <CardTitle>AdvisorSol</CardTitle>
          <CardDescription>Plataforma de Análises de Investimentos</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <div
                className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md"
                role="alert"
                aria-live="polite">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-describedby="email-error"
                aria-invalid={error ? "true" : "false"}
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-describedby="password-error"
                aria-invalid={error ? "true" : "false"}
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              aria-describedby="login-help">
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p id="login-help" className="text-center text-sm text-muted-foreground mt-4" role="note">
            Use qualquer e-mail e senha para acessar
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
