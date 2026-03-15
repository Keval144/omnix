"use client";

import type * as React from "react";
import { ThemeProvider } from "@/components/provider/theme-provider";
import LenisProvider from "./lenis-provider";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LenisProvider>{children}</LenisProvider>
    </ThemeProvider>
  );
}
