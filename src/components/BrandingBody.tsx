"use client";
import { useApplyBranding } from "@/hooks/useApplyBranding";
import React from "react";

export default function BrandingBody({ children, className }: { children: React.ReactNode; className?: string }) {
  useApplyBranding();
  return <div className={className}>{children}</div>;
}
