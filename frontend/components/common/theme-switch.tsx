// app/theme-switch.tsx
"use client";

import { useCallback } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/shadcn-ui/button";
import { cn } from "@/lib/utils";

interface ThemeSwitchProps {
  className?: string;
  variant?:
    | "outline"
    | "link"
    | "default"
    | "destructive"
    | "secondary"
    | "ghost"
    | null
    | undefined;
}

export function ThemeSwitch({
  className,
  variant = "outline",
}: ThemeSwitchProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  return (
    <Button
      variant={variant}
      size="icon"
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className={cn("relative cursor-pointer rounded-full", className)}
    >
      <Sun
        className={cn(
          "h-[1.2rem] w-[1.2rem] transition-all",
          "scale-100 rotate-0",
          "dark:scale-0 dark:-rotate-90",
        )}
      />

      <Moon
        className={cn(
          "absolute h-[1.2rem] w-[1.2rem] transition-all",
          "scale-0 rotate-90",
          "dark:scale-100 dark:rotate-0",
        )}
      />

      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
