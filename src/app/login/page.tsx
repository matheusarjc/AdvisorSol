"use client";
import React, { useState, useEffect } from "react";
import { Login } from "@/components/auth/Login";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";

export default function Page() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const { signIn, user } = useAuth();

  useEffect(() => {
    const savedDarkMode =
      typeof window !== "undefined" ? localStorage.getItem("advisorsol-dark-mode") : null;
    if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("advisorsol-dark-mode", JSON.stringify(darkMode));
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const handleLogin = async (email: string, password: string) => {
    await signIn(email, password);
    router.replace("/dashboard");
  };

  if (user) {
    router.replace("/dashboard");
    return null;
  }

  return (
    <Login
      onLogin={handleLogin}
      darkMode={darkMode}
      onToggleDarkMode={() => setDarkMode(!darkMode)}
    />
  );
}
