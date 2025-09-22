"use client";
import React, { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/components/providers/auth-provider";
import { preloadCriticalAssets } from "@/lib/preload";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { signOutUser } = useAuth();

  useEffect(() => {
    const savedDarkMode =
      typeof window !== "undefined" ? localStorage.getItem("advisorsol-dark-mode") : null;
    if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));

    // Preload critical assets for faster navigation
    preloadCriticalAssets();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("advisorsol-dark-mode", JSON.stringify(darkMode));
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          currentScreen={""}
          onNavigate={() => {}}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            onLogout={() => signOutUser()}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <main className="flex-1 overflow-auto p-6">
            <div className="animate-in fade-in-50 duration-200">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
