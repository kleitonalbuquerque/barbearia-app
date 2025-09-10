"use client";
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: string; email: string; role: string } | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchAuthed: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  // Restaurar sessão do cookie ao carregar
  useEffect(() => {
    setLoading(true);
    fetch("/api/auth/me", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) setUser(data.user);
        else setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);
  const isAuthenticated = !!user;

  async function login(email: string, password: string) {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success && data.user) {
        // Força reload para garantir que o AuthContext detecte o cookie httpOnly
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  function logout() {
    setUser(null);
  }

  // Helper para fetch autenticado
  const fetchAuthed = React.useCallback(
    async (input: RequestInfo, init: RequestInit = {}) => {
      if (!user?.email) throw new Error("Usuário não autenticado");
      const headers = new Headers(init.headers || {});
      headers.set("Authorization", `Bearer ${user.email}`);
      return fetch(input, { ...init, headers });
    },
    [user]
  );

  const value = useMemo(() => ({ isAuthenticated, user, loading, login, logout, fetchAuthed }), [isAuthenticated, user, loading, fetchAuthed]);
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
