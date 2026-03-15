import type * as React from "react";
import { AppProvider } from "@/components/provider/app-provider";

export default function App({ children }: { children: React.ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}
