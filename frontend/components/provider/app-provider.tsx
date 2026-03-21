"use client";

import type * as React from "react";
import { ThemeProvider } from "@/components/provider/theme-provider";
import LenisProvider from "./lenis-provider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LenisProvider>{children}</LenisProvider>
      <Analytics />
      <SpeedInsights />
    </ThemeProvider>
  );
}
