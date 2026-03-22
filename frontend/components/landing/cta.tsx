"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/shadcn-ui/button";

export function CTASection() {
  return (
    <section className="px-4 py-20 sm:px-6 md:py-28 lg:px-12">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-2xl text-center"
      >
        <h2 className="text-3xl font-light tracking-tight sm:text-4xl md:text-5xl">
          Start exploring <span className="font-medium text-primary">AI</span>
        </h2>

        <p className="mt-4 text-pretty text-muted-foreground">
          Experiment with machine learning, data, and models directly in your
          browser.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-8"
        >
          <Button
            size="lg"
            className="h-11 rounded-full px-8 text-base sm:px-10"
            nativeButton={false}
            render={
              <Link
                href="/simulations"
                className="group flex items-center gap-2"
              />
            }
          >
            Explore
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
