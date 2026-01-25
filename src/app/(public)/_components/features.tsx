"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FolderSearch, Terminal, Mic } from "lucide-react";

const FEATURES = [
  {
    icon: FolderSearch,
    headline: "Files That Understand Context",
    copy: "Stop thinking in folders and filenames. GadgetOS understands what your files mean, how you use them, and when they matter. Search by intent. Organize automatically. Get recommendations before you ask.",
    highlights: [
      "AI-assisted file organization",
      "Semantic search by meaning",
      "Smart folder and priority suggestions",
    ],
  },
  {
    icon: Terminal,
    headline: "A Terminal That Speaks Human",
    copy: "Use traditional commands or describe what you want to do. The AI-powered terminal translates intent into execution, explains actions before they run, and keeps you in full control.",
    highlights: [
      "Natural language commands",
      "Command explanation mode",
      "Safe, sandboxed execution",
    ],
  },
  {
    icon: Mic,
    headline: "Speak. Create. Execute.",
    copy: "Create files, write code, and run tasks using your voice. GadgetOS listens, understands, and confirms critical actions before execution.",
    highlights: [
      "Voice-to-file creation",
      "Code execution automation",
      "AI confirmation layer",
    ],
  },
];

export function Features() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section
      id="features"
      ref={ref}
      className="border-b border-border/40 bg-background px-4 py-20 sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <motion.h2
          className="sr-only"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
        >
          Core Features (Web Demo)
        </motion.h2>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.headline}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.08 * i }}
            >
              <Card className="h-full overflow-hidden rounded-2xl border border-border/60 bg-card transition-shadow hover:shadow-lg">
                <CardHeader className="pb-2">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">
                    {f.headline}
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{f.copy}</p>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {f.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
