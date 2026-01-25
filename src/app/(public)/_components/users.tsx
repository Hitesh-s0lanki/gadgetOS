"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Code2, GraduationCap, Palette, Wrench } from "lucide-react";

const BLOCKS = [
  {
    icon: Code2,
    title: "Developers",
    copy: "Faster workflows, smarter terminals, and less time fighting tools.",
  },
  {
    icon: GraduationCap,
    title: "Students",
    copy: "Learn systems through interaction, not memorization.",
  },
  {
    icon: Palette,
    title: "Creators",
    copy: "Automate repetitive tasks and focus on ideas.",
  },
  {
    icon: Wrench,
    title: "Builders",
    copy: "Prototype workflows and systems at the operating system level.",
  },
];

export function Users() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section
      id="users"
      ref={ref}
      className="border-b border-border/40 bg-muted/30 px-4 py-20 sm:px-6"
    >
      <div className="mx-auto max-w-4xl">
        <motion.h2
          className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
        >
          Built for How You Work Next
        </motion.h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BLOCKS.map((b, i) => (
            <motion.article
              key={b.title}
              className="group flex gap-4 rounded-2xl border border-border/60 bg-background p-5 transition-colors hover:border-border"
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.06 * i }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <b.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{b.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{b.copy}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Users;
