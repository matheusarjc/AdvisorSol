import React from "react";
import { Button } from "../ui/button";
import { LogOut, TrendingUp, Moon, Sun, Menu } from "lucide-react";

interface HeaderProps {
  onLogout: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onToggleSidebar: () => void;
}

export function Header({ onLogout, darkMode, onToggleDarkMode, onToggleSidebar }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border shadow-sm" role="banner">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden"
            aria-label="Alternar menu lateral"
            aria-expanded="false"
            aria-controls="sidebar">
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
          <div className="flex items-center space-x-3">
            <div className="bg-primary p-2 rounded-lg" role="img" aria-label="Logo AdvisorSol">
              <TrendingUp className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">AdvisorSol</h1>
              <p className="text-xs text-muted-foreground">
                Plataforma de Análises de Investimentos
              </p>
            </div>
          </div>
        </div>

        <nav
          className="flex items-center space-x-2"
          role="navigation"
          aria-label="Ações do usuário">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleDarkMode}
            aria-label={darkMode ? "Ativar modo claro" : "Ativar modo escuro"}
            title={darkMode ? "Ativar modo claro" : "Ativar modo escuro"}>
            {darkMode ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            aria-label="Fazer logout da aplicação">
            <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
            Sair
          </Button>
        </nav>
      </div>
    </header>
  );
}
