"use client";

import { Toaster } from "sonner";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-background px-4 py-10 sm:px-6 sm:py-12">
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

      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          backgroundImage:
            "radial-gradient(125% 125% at 50% 90%, transparent 0%, hsl(var(--primary) / 0.08) 50%, hsl(var(--primary) / 0.15) 100%)",
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
        aria-hidden
      >
        <div
          className="absolute left-1/2 top-1/2 h-[18rem] w-[44rem] max-w-[140vw] -translate-x-1/2 translate-y-[35%] sm:h-[22rem]"
          style={{
            background:
              "radial-gradient(ellipse at center, #22c55e 0%, rgba(34,197,94,0.55) 20%, rgba(34,197,94,0.15) 50%, transparent 72%)",
            filter: "blur(28px)",
          }}
        />
      </div>

      <div className="relative z-20 flex w-full max-w-md items-center justify-center">
        {children}
      </div>

      <Toaster />
    </div>
  );
}
