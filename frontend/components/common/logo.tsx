"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  size?: number;
};

/* ---------------- Static Logo ---------------- */

export function Logo({ className, size = 44 }: LogoProps) {
  const src = "/logo.png";

  return (
    <Image
      src={src}
      alt="Omnix logo"
      width={size}
      height={size}
      priority
      quality={100}
      className={cn(
        "rounded-full [&>img]:pointer-events-none select-none border-green-400 border-2",
        className,
      )}
    />
  );
}
