import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Globe,
  Building2,
  TrendingUp,
  DollarSign,
  Activity,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import { cn } from "../ui/utils";
import { Button } from "../ui/button";

interface SidebarProps {
  currentScreen: string;
  onNavigate: (screen: any) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Activity },
  { id: "renda-fixa-brasil", label: "RF Brasil", icon: Building2 },
  { id: "renda-fixa-eua", label: "RF EUA", icon: DollarSign },
  { id: "mercado-macro", label: "Macro", icon: Globe },
  { id: "renda-variavel-brasil", label: "RV Brasil", icon: BarChart3 },
  { id: "renda-variavel-eua", label: "RV EUA", icon: TrendingUp },
  { id: "risk-analysis", label: "Risco", icon: Shield },
];

export function Sidebar({ currentScreen, onNavigate, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  return (
    <aside
      id="sidebar"
      className={cn(
        "bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
      role="navigation"
      aria-label="Menu principal">
      <div className="p-4 border-b border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full justify-center"
          aria-label={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          aria-expanded={!collapsed}
          aria-controls="sidebar-nav">
          {collapsed ? (
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>

      <nav
        id="sidebar-nav"
        className="flex-1 p-4"
        role="navigation"
        aria-label="Navegação principal">
        <ul className="space-y-2" role="menubar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.includes(item.id);
            const href = `/${item.id === "dashboard" ? "dashboard" : item.id}`;

            return (
              <li key={item.id} role="none">
                <Link
                  href={href as any}
                  prefetch
                  role="menuitem"
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center"
                  )}
                  title={collapsed ? item.label : undefined}
                  aria-label={collapsed ? item.label : undefined}>
                  <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
