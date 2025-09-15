"use client";
import React, { createContext, useContext, useState, ReactNode, useMemo } from "react";

interface TenantContextType {
  tenantId: string;
  setTenantId: (id: string) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  // Inicializa tenantId a partir do localStorage, query param ou vazio
  const [tenantId, setTenantId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const fromStorage = window.localStorage.getItem("tenantId");
      if (fromStorage) return fromStorage;
      // Pode adicionar lógica para query param futuramente
    }
    return "";
  });

  // Sempre que tenantId mudar, salva no localStorage
  React.useEffect(() => {
    if (tenantId) {
      window.localStorage.setItem("tenantId", tenantId);
    }
  }, [tenantId]);

  const value = useMemo(() => ({ tenantId, setTenantId }), [tenantId]);
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) throw new Error("useTenant must be used within a TenantProvider");
  return context;
}
