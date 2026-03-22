import { MenuIcon, XIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

import { navLinks } from "@/components/common/header";
import { Button } from "@/components/shadcn-ui/button";
import { Portal, PortalBackdrop } from "@/components/shadcn-ui/portal";
import { ScrollArea } from "@/components/shadcn-ui/scroll-area";
import { cn } from "@/lib/utils";

import { ThemeSwitch } from "./common/theme-switch";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="md:hidden">
      <Button
        aria-controls="mobile-menu"
        aria-expanded={open}
        aria-label="Toggle menu"
        className="md:hidden"
        onClick={() => setOpen(!open)}
        size="icon"
        variant="outline"
      >
        {open ? (
          <XIcon className="size-4.5" />
        ) : (
          <MenuIcon className="size-4.5" />
        )}
      </Button>
      {open && (
        <Portal className="top-14" id="mobile-menu">
          <PortalBackdrop />
          <div
            className={cn(
              "data-[slot=open]:zoom-in-97 ease-out data-[slot=open]:animate-in",
              "size-full bg-background/95 p-4 backdrop-blur-sm",
            )}
            data-slot={open ? "open" : "closed"}
          >
            <ScrollArea className="h-full w-full pr-2">
              <div className="grid gap-y-2 pb-4">
                {navLinks.map((link) => (
                  <Button
                    className="justify-start"
                    key={link.label}
                    variant="ghost"
                    nativeButton={false}
                    render={
                      <Link href={link.href} onClick={() => setOpen(false)} />
                    }
                  >
                    {link.label}
                  </Button>
                ))}
              </div>
              <div className="mt-4 pb-4">
                <ThemeSwitch variant="ghost" />
              </div>
              <div className="mt-4 flex flex-col gap-2 pb-6">
                <Button
                  className="w-full"
                  variant="outline"
                  nativeButton={false}
                  render={
                    <Link href="/sign-in" onClick={() => setOpen(false)} />
                  }
                >
                  Sign In
                </Button>
                <Button
                  className="w-full"
                  nativeButton={false}
                  render={
                    <Link href="/sign-up" onClick={() => setOpen(false)} />
                  }
                >
                  Get Started
                </Button>
              </div>
            </ScrollArea>
          </div>
        </Portal>
      )}
    </div>
  );
}
