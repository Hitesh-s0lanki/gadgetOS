"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";

export function Product() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      id="product"
      ref={ref}
      className="border-b border-border/40 bg-background px-4 py-20 sm:px-6"
    >
      <div className="mx-auto max-w-2xl">
        <motion.h2
          className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
        >
          Meet the Next Generation Operating System
        </motion.h2>

        <motion.div
          className="mt-6 space-y-4 text-muted-foreground"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <p>
            GadgetOS is an AI-native operating system built from the ground up
            to understand human intent.
          </p>
          <p>
            Instead of forcing users to adapt to rigid interfaces, GadgetOS
            adapts to how you think, speak, and work.
          </p>
          <p>
            Manage files by meaning. Execute commands in natural language.
            Automate workflows without writing glue code.
          </p>
          <p className="font-medium text-foreground">
            This is not a skin. This is a new foundation for computing.
          </p>
        </motion.div>

        <motion.p
          className="mt-8 text-sm font-medium text-muted-foreground"
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.16 }}
        >
          Minimal on the surface.
          <br />
          Powerful underneath.
        </motion.p>
      </div>
    </section>
  );
}

export default Product;
