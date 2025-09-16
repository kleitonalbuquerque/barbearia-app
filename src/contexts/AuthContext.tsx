"use client";
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from "react";


interface AuthUser {
  id: string;
  email: string;
  role: string;
  tenantId?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchAuthed: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  // Restaurar sessão do cookie ao carregar
  useEffect(() => {
    const PUBLIC_PATHS = [
      '/login',
      '/tenants/novo',
    ];
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + '/'));
      if (isPublic) {
        setLoading(false);
        return;
      }
    }
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
        setUser(data.user);
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
