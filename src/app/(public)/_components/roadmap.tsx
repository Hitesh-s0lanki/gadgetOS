"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { CheckCircle2, Circle, CircleDot } from "lucide-react";

const MILESTONES = [
  {
    icon: Circle,
    title: "Web OS Demo",
    tag: "Early Access",
    items: [
      "Browser-based operating environment",
      "Core AI-driven workflows",
    ],
  },
  {
    icon: CircleDot,
    title: "Extended Web Capabilities",
    tag: null,
    items: [
      "Plugins and extensions",
      "Improved AI session memory",
      "Advanced automation flows",
    ],
  },
  {
    icon: CheckCircle2,
    title: "Native GadgetOS",
    tag: "December 2026",
    items: [
      "Installable operating system",
      "Full hardware access",
      "Offline-first intelligence",
    ],
  },
];

export function Roadmap() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section
      id="roadmap"
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
          The Journey Ahead
        </motion.h2>

        <div className="mt-10 space-y-0">
          {MILESTONES.map((m, i) => (
            <motion.div
              key={m.title}
              className="relative flex gap-4 sm:gap-6 pb-10 last:pb-0"
              initial={{ opacity: 0, x: -8 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.08 * i }}
            >
              {i < MILESTONES.length - 1 && (
                <div
                  className="absolute left-3 top-8 h-[calc(100%-0.5rem)] w-px -translate-x-1/2 bg-border"
                  aria-hidden
                />
              )}
              <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center">
                <m.icon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-foreground">{m.title}</h3>
                  {m.tag && (
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {m.tag}
                    </span>
                  )}
                </div>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {m.items.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="mt-10 text-sm text-muted-foreground"
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          The Web Demo is just the beginning. The real power of GadgetOS arrives
          with the native OS.
        </motion.p>
      </div>
    </section>
  );
}

export default Roadmap;
