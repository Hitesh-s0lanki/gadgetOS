"use client";

import Link from "next/link";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      id="hero"
      ref={ref}
      className="min-h-screen relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-muted/30 to-background px-4 pt-16 pb-24 sm:px-6 flex justify-center items-center"
    >
      {/* Subtle grid (OS UI feel) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        aria-hidden
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px),
                             linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
        >
          <Badge
            variant="secondary"
            className="mb-6 rounded-full border border-border/60 px-3 py-1 text-xs font-medium"
          >
            Releasing December 2026
          </Badge>
        </motion.div>

        <motion.h1
          className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          GadgetOS
        </motion.h1>
        <motion.p
          className="mt-3 text-xl font-medium text-foreground sm:text-2xl"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          The Operating System That Thinks With You
        </motion.p>

        <motion.p
          className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.15 }}
        >
          An AI-powered operating system designed for the next generation of
          creators, developers, and builders.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.25 }}
        >
          <Button size="lg" className="rounded-full px-6" asChild>
            <Link href="/demo">Try the Web OS Demo</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full px-6"
            asChild
          >
            <Link href="#early-access">Join Early Access</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
