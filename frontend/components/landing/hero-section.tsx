"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { Button } from "../shadcn-ui/button";

export default function Hero() {
  return (
    <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-4 py-20 text-center sm:px-6 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl">
          <span className="text-primary">A Better Way</span>
          <br />
          to Build with Data
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:mt-6 sm:text-lg">
          Turn raw datasets into insights with AI-powered workflows.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Button
            className="h-11 w-full rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90 sm:w-auto"
            nativeButton={false}
            render={<Link href="/sign-up" />}
          >
            Get Started
          </Button>
        </div>

        <p className="mt-8 text-xs leading-6 text-muted-foreground sm:text-sm">
          Interactive notebooks | Real datasets | Python environment
        </p>
      </div>

      <ScrollIndicator />
    </section>
  );
}

export function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
      className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 sm:bottom-10 sm:block"
    >
      <div className="flex h-10 w-6 items-start justify-center rounded-full border border-muted-foreground/30 p-2">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="h-2 w-1 rounded-full bg-primary/60"
        />
      </div>
    </motion.div>
  );
}
