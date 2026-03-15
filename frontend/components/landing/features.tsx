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
    <section className="px-6 lg:px-12 py-24 md:py-32">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mb-20"
        >
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-primary">
            Features
          </span>

          <h2 className="mt-4 text-3xl md:text-4xl font-light tracking-tight">
            Build AI notebooks
            <br />
            <span className="font-medium">without complexity</span>
          </h2>
        </motion.div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-3 gap-12 md:gap-10">
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

              <h3 className="mt-3 text-xl font-medium tracking-tight group-hover:text-primary transition-colors">
                {item.title}
              </h3>

              <p className="mt-3 text-muted-foreground leading-relaxed text-sm">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
