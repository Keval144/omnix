"use client";

import type * as React from "react";
import { ThemeProvider } from "@/components/provider/theme-provider";
import LenisProvider from "./lenis-provider";
import { Toaster } from "@/components/shadcn-ui/sonner";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LenisProvider>{children}</LenisProvider>
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: "oklch(0.16 0.014 145)",
            border: "1px solid oklch(0.28 0.04 149 / 0.6)",
            color: "oklch(0.92 0.01 145)",
          },
        }}
      />
    </ThemeProvider>
  );
}
