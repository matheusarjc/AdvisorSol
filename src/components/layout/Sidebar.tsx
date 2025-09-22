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
      className={cn(
        "bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}>
      <div className="p-4 border-b border-sidebar-border">
        <Button variant="ghost" size="sm" onClick={onToggle} className="w-full justify-center">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.includes(item.id);

            return (
              <li key={item.id}>
                <Link
                  href={`/${item.id === "dashboard" ? "dashboard" : item.id}`}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors text-sm",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center"
                  )}
                  title={collapsed ? item.label : undefined}>
                  <Icon className="h-4 w-4 flex-shrink-0" />
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
