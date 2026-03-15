"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/shadcn-ui/button";

export function FreePricing() {
  const features = [
    "Up to 5 Projects",
    "Executable AI Notebooks",
    "RAG Knowledge Access",
    "Python Environment",
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto text-center">
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Start Building for Free
        </h2>
        <p className="text-muted-foreground mt-3">
          Run AI notebooks, experiment with data, and build projects.
        </p>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 mx-auto max-w-md rounded-xl border border-border bg-background p-8 shadow-sm"
        >
          {/* Plan */}
          <div className="text-sm text-muted-foreground">Free Plan</div>

          {/* Price */}
          <div className="mt-2 text-5xl font-semibold">$0</div>
          <div className="text-sm text-muted-foreground">Forever free</div>

          {/* Features */}
          <ul className="mt-8 space-y-3 text-left">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Button className="w-full mt-8">Get Started</Button>
        </motion.div>
      </div>
    </section>
  );
}
