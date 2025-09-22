"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

// Mock user type for development
interface MockUser {
  uid: string;
  email: string;
  displayName?: string;
  getIdToken: () => Promise<string>;
}

interface AuthContextValue {
  user: MockUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const existingSession = document.cookie
      .split("; ")
      .find((row) => row.startsWith("session="))
      ?.split("=")[1];

    if (existingSession && existingSession !== "") {
      // Mock user from existing session
      setUser({
        uid: "demo-user-123",
        email: "demo@advisorsol.com",
        displayName: "Demo User",
        getIdToken: async () => "demo-token-123",
      });
    }

    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Mock authentication - accept any email/password for demo
    if (email && password) {
      const mockUser: MockUser = {
        uid: "demo-user-123",
        email: email,
        displayName: "Demo User",
        getIdToken: async () => "demo-token-123",
      };

      setUser(mockUser);
      document.cookie = `session=demo-token-123; path=/; max-age=3600; samesite=lax`;
    } else {
      throw new Error("Email and password required");
    }
  };

  const signOutUser = async () => {
    setUser(null);
    document.cookie = `session=; path=/; max-age=0; samesite=lax`;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
