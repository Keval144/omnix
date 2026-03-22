"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/shadcn-ui/button";

export function FreePricing() {
  const features = [
    "Up to 5 Projects",
    "Executable AI Notebooks",
    "RAG Knowledge Access",
    "Python Environment",
  ];

  return (
    <section className="px-4 py-20 sm:px-6 md:py-24">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Start Building for Free
        </h2>
        <p className="mt-3 text-muted-foreground">
          Run AI notebooks, experiment with data, and build projects.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mt-10 max-w-md rounded-xl border border-border bg-background p-6 shadow-sm sm:mt-12 sm:p-8"
        >
          <div className="text-sm text-muted-foreground">Free Plan</div>

          <div className="mt-2 text-4xl font-semibold sm:text-5xl">$0</div>
          <div className="text-sm text-muted-foreground">Forever free</div>

          <ul className="mt-8 space-y-3 text-left">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            className="mt-8 w-full"
            nativeButton={false}
            render={<Link href="/sign-up" />}
          >
            Get Started
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
