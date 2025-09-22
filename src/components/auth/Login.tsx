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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) await onLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleDarkMode}
        className="absolute top-4 right-4">
        {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary p-3 rounded-lg w-fit mb-4">
            <TrendingUp className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle>AdvisorSol</CardTitle>
          <CardDescription>Plataforma de Análises de Investimentos</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
              />
            </div>
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Use qualquer e-mail e senha para acessar
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
