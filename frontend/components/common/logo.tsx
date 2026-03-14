"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  size?: number;
};

/* ---------------- Static Logo ---------------- */

export function Logo({ className, size = 44 }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const src = mounted && resolvedTheme === "dark" ? "/white.png" : "/dark.png";

  return (
    <Image
      src={src}
      alt="Omnix logo"
      width={size}
      height={size}
      priority
      className={cn(
        "rounded-full [&>img]:pointer-events-none select-none",
        className,
      )}
    />
  );
}

/* ---------------- Animated Logo ---------------- */

export function AnimatedLogo({ className, size = 44 }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [theme, setTheme] = useState<string | undefined>(undefined);

  useEffect(() => {
    setTheme(resolvedTheme);
  }, [resolvedTheme]);

  const isDark = theme === "dark";

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full",
        className,
      )}
      style={{ width: size, height: size }}
      aria-label="Omnix logo"
    >
      <Image
        src="/dark.png"
        alt="Omnix dark logo"
        fill
        priority
        className={cn(
          "object-cover transition-all duration-500 ease-out [&>img]:pointer-events-none select-none",
          isDark
            ? "rotate-180 opacity-0 scale-75"
            : "rotate-0 opacity-100 scale-100",
        )}
      />

      <Image
        src="/white.png"
        alt="Omnix light logo"
        fill
        priority
        className={cn(
          "object-cover transition-all duration-500 ease-out [&>img]:pointer-events-none select-none",
          isDark
            ? "rotate-0 opacity-100 scale-100"
            : "-rotate-180 opacity-0 scale-75",
        )}
      />
    </div>
  );
}
