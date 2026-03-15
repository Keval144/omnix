"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* Hero Content */}
      <div className="max-w-2xl">
        <h1 className="text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
          <span className="text-primary">A Better Way</span>
          <br />
          to Build with Data
        </h1>

        <p className="mt-6 text-lg text-muted-foreground">
          Turn raw datasets into insights with AI-powered workflows.
        </p>

        {/* CTA */}
        <div className="mt-8 flex justify-center gap-4">
          <button className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90">
            Get Started
          </button>

          <button className="rounded-lg border px-6 py-3 text-sm font-medium hover:bg-muted">
            View Demo
          </button>
        </div>

        {/* Secondary text */}
        <p className="mt-8 text-sm text-muted-foreground">
          Interactive Notebooks • Real datasets • Python Enviorment
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
      className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden sm:block"
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
