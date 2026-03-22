"use client";

import { motion } from "framer-motion";

const features = [
  {
    num: "01",
    title: "RAG Knowledge Built-in",
    desc: "Access curated RAG knowledge sources. Query documents, explore AI concepts, and build retrieval-powered workflows.",
  },
  {
    num: "02",
    title: "Zero AI Experience Needed",
    desc: "Works even if you have no AI or ML background. The platform guides you through experimentation and learning.",
  },
  {
    num: "03",
    title: "No AI Engineer Required",
    desc: "Build and test AI ideas without hiring expensive ML engineers. Everything runs directly in the notebook environment.",
  },
];

export function FeaturesSection() {
  return (
    <section className="px-4 py-20 sm:px-6 md:py-28 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 max-w-xl sm:mb-16 md:mb-20"
        >
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Features
          </span>

          <h2 className="mt-4 text-3xl font-light tracking-tight sm:text-4xl md:text-5xl">
            Build AI notebooks
            <br />
            <span className="font-medium">without complexity</span>
          </h2>
        </motion.div>

        <div className="grid gap-10 sm:gap-12 md:grid-cols-3 md:gap-10">
          {features.map((item, i) => (
            <motion.div
              key={item.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="group"
            >
              <span className="text-2xl font-mono text-primary/60">
                {item.num}
              </span>

              <h3 className="mt-3 text-lg font-medium tracking-tight transition-colors group-hover:text-primary sm:text-xl">
                {item.title}
              </h3>

              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
