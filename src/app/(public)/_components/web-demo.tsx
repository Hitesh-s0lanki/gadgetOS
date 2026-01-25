"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Monitor, Terminal, FolderOpen } from "lucide-react";

export function WebDemo() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section
      id="web-demo"
      ref={ref}
      className="border-b border-border/40 bg-muted/30 px-4 py-20 sm:px-6"
    >
      <div className="mx-auto max-w-3xl">
        <motion.h2
          className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
        >
          Experience GadgetOS in Your Browser
        </motion.h2>

        <motion.div
          className="mt-6 space-y-4 text-muted-foreground"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.06 }}
        >
          <p>
            The Web OS Demo is a sandboxed, browser-based environment that gives
            you a hands-on preview of GadgetOS.
          </p>
          <p>
            It demonstrates how AI-driven file management, intelligent
            terminals, and automation work together inside an operating system.
          </p>
          <p>
            No installation. No system risk. Just the experience.
          </p>
        </motion.div>

        <motion.p
          className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-900 dark:border-amber-400/25 dark:bg-amber-500/10 dark:text-amber-200"
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.12 }}
        >
          This is an early-access demo. The native operating system will launch
          in December 2026.
        </motion.p>

        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.18 }}
        >
          <Card className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-zinc-900 to-zinc-950 shadow-xl">
            <CardContent className="p-0">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="grid grid-cols-1 gap-px bg-white/5 sm:grid-cols-3">
                <div className="flex flex-col items-center justify-center gap-3 bg-zinc-900/50 p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                    <FolderOpen className="h-6 w-6 text-cyan-400" />
                  </div>
                  <span className="text-sm font-medium text-zinc-300">
                    File Manager
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center gap-3 bg-zinc-900/50 p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                    <Terminal className="h-6 w-6 text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium text-zinc-300">
                    AI Terminal
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center gap-3 bg-zinc-900/50 p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                    <Monitor className="h-6 w-6 text-violet-400" />
                  </div>
                  <span className="text-sm font-medium text-zinc-300">
                    Workspace
                  </span>
                </div>
              </div>
              <div className="border-t border-white/10 p-4">
                <Button className="w-full rounded-lg" asChild>
                  <Link href="/demo">Launch Web Demo</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

export default WebDemo;
