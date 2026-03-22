"use client";

import Link from "next/link";

import { MobileNav } from "@/components/mobile-nav";
import { Button } from "@/components/shadcn-ui/button";
import { useScroll } from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";

import { Logo } from "./logo";
import { ThemeSwitch } from "./theme-switch";

export const navLinks = [
  { label: "Features", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "About", href: "#" },
];

export function Header() {
  const scrolled = useScroll(30);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 mx-auto mt-1.5 w-full border-b border-transparent px-2 sm:px-4 md:max-w-5xl md:px-0 md:rounded-md md:border md:transition-all md:ease-out",
        {
          "border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50 md:top-2 md:max-w-3xl md:shadow":
            scrolled,
        },
      )}
    >
      <nav
        className={cn(
          "flex h-14 w-full items-center justify-between rounded-[inherit] px-3 sm:px-4 md:h-12 md:transition-all md:ease-out",
          {
            "md:px-2": scrolled,
          },
        )}
      >
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md p-2 hover:bg-muted dark:hover:bg-muted/50"
        >
          <Logo size={32} />
          <span className="font-semibold">Omnix</span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <div className="flex gap-1">
            {navLinks.map((link) => (
              <Button
                key={link.label}
                size="sm"
                variant="ghost"
                nativeButton={false}
                render={<Link href={link.href} />}
              >
                {link.label}
              </Button>
            ))}
          </div>
          <ThemeSwitch variant="ghost" />
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href="/sign-in" />}
          >
            Sign In
          </Button>

          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/sign-up" />}
          >
            Get Started
          </Button>
        </div>

        <MobileNav />
      </nav>
    </header>
  );
}
