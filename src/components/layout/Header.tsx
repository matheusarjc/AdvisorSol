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
    <header className="bg-card border-b border-border shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onToggleSidebar} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-3">
            <div className="bg-primary p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">AdvisorSol</h1>
              <p className="text-xs text-muted-foreground">
                Plataforma de Análises de Investimentos
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={onToggleDarkMode}>
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
