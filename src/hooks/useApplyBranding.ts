
"use client";
import { useEffect } from "react";

export function useApplyBranding() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const brandingRaw = window.localStorage.getItem("branding");
    if (!brandingRaw) return;
    try {
      const branding = JSON.parse(brandingRaw);
      // Aplica todas as cores do branding como variáveis CSS
      if (branding.accentColor) {
        document.documentElement.style.setProperty("--primary", branding.accentColor);
      }
      if (branding.secondaryColor) {
        document.documentElement.style.setProperty("--secondary", branding.secondaryColor);
      }
      if (branding.primaryColor) {
        document.documentElement.style.setProperty("--accent", branding.primaryColor);
      }
      if (branding.textColor) {
        document.documentElement.style.setProperty("--text", branding.textColor);
      }
    } catch {}
  }, []);
}
