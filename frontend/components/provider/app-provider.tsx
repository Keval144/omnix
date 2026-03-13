"use client";

import * as React from "react";
import { ThemeProvider } from "@/components/provider/theme-provider";

export function AppProvider({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			{children}
		</ThemeProvider>
	);
}
