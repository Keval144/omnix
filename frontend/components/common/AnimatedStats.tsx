"use client";

import { motion, useSpring, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

function AnimatedNumber({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const spring = useSpring(0, { stiffness: 80, damping: 20 });
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [spring, isInView, value]);

  useEffect(() => {
    return spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.floor(latest) + suffix;
      }
    });
  }, [spring, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

const stats = [
  { value: 40, suffix: "+", label: "Executed Notebooks" },
  { value: 50, suffix: "+", label: "Curated RAG Knowledge Sources" },
  { value: 100, suffix: "%", label: "Free & Open Platform" },
];

export function StatsSection() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="border-y border-border/60 bg-muted/30"
    >
      <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-3 gap-8 text-center">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
          >
            <div className="text-3xl md:text-4xl font-light text-foreground">
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
            </div>

            <div className="text-sm text-muted-foreground mt-1">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
