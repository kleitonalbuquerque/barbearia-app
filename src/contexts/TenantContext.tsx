"use client";
import React, { createContext, useContext, useState, ReactNode, useMemo } from "react";

interface TenantContextType {
  tenantId: string;
  subdomain: string;
  setTenantId: (id: string, subdomain?: string) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  // Inicializa tenantId e subdomain a partir do localStorage ou vazio
  const [tenantId, setTenantIdState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const fromStorage = window.localStorage.getItem("tenantId");
      if (fromStorage) return fromStorage;
    }
    return "";
  });
  const [subdomain, setSubdomainState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const fromStorage = window.localStorage.getItem("tenantSubdomain");
      if (fromStorage) return fromStorage;
    }
    return "";
  });

  // Sempre que tenantId ou subdomain mudar, salva no localStorage
  React.useEffect(() => {
    if (tenantId) {
      window.localStorage.setItem("tenantId", tenantId);
    }
    if (subdomain) {
      window.localStorage.setItem("tenantSubdomain", subdomain);
    }
  }, [tenantId, subdomain]);

  const setTenantId = (id: string, subdomainValue?: string) => {
    setTenantIdState(id);
    if (subdomainValue) setSubdomainState(subdomainValue);
  };
  const value = useMemo(() => ({ tenantId, subdomain, setTenantId }), [tenantId, subdomain]);
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) throw new Error("useTenant must be used within a TenantProvider");
  return context;
}
