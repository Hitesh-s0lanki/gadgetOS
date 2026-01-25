"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function WaitingList() {
  const [email, setEmail] = useState("");
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: connect backend
  };

  return (
    <section
      ref={ref}
      id="early-access"
      className="
        relative overflow-hidden px-4 py-28 sm:px-6
        bg-slate-50
      "
    >
      {/* Gradient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-20%] h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-[-30%] right-[-10%] h-[400px] w-[400px] rounded-full bg-violet-500/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-xl text-center">
        {/* Headline */}
        <motion.p
          className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
        >
          Early Access
        </motion.p>

        <motion.h2
          className="text-3xl font-semibold tracking-tight sm:text-4xl"
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.05 }}
        >
          {"Don't miss out, join the queue"}
          <br className="hidden sm:block" />
          and get to know first
        </motion.h2>

        <motion.p
          className="mx-auto mt-4 max-w-md text-muted-foreground"
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
        >
          Get priority access to GadgetOS Web Demo, early features, and help
          shape the future of an AI-first operating system.
        </motion.p>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15 }}
          className="
            mx-auto mt-10 rounded-2xl border
            bg-background/70 p-6 shadow-xl
            backdrop-blur-xl
          "
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-lg transition-colors placeholder:text-muted-foreground/80"
            />

            <Button
              size="lg"
              className="
                w-full rounded-full
                bg-primary text-primary-foreground
                hover:opacity-90
              "
            >
              Join the waiting list
            </Button>
          </form>

          {/* Social proof */}
          <p className="mt-4 text-xs text-muted-foreground">
            No spam. Only meaningful updates.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
