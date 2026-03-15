"use client";

import { Toaster } from "sonner";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* Dot Grids */}
      <div
        className="pointer-events-none absolute inset-0 z-0 dark:hidden"
        style={{
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.15) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 hidden dark:block"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />

      {/* Bottom Gradient Fade - Coming from bottom */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          backgroundImage:
            "radial-gradient(125% 125% at 50% 90%, transparent 0%, hsl(var(--primary) / 0.08) 50%, hsl(var(--primary) / 0.15) 100%)",
        }}
      />

      {/* Glow Effects Container */}
      <div className="pointer-events-none absolute inset-0 z-10" aria-hidden>
        {/* Primary Glow - Lower Left */}
        <div
          className="absolute"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, 40%)",
            width: "1800px",
            height: "400px",
            background:
              "radial-gradient(ellipse at center, #22c55e 0%, rgba(34,197,94,0.55) 20%, rgba(34,197,94,0.15) 50%, transparent 72%)",
            filter: "blur(28px)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-20 flex w-full items-center justify-center">
        {children}
      </div>

      <Toaster />
    </div>
  );
}
