"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/shadcn-ui/button";

export function CTASection() {
  return (
    <section className="px-6 lg:px-12 py-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto text-center"
      >
        <h2 className="text-3xl md:text-4xl font-light tracking-tight">
          Start exploring{" "}
          <span className="text-primary font-medium">AI</span>{" "}
        </h2>

        <p className="mt-4 text-muted-foreground">
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
          <Button size="lg" className="h-11 px-10 text-base rounded-full">
            <Link href="/simulations" className="flex items-center gap-2 group">
              Explore
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
