"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";

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
      className="relative overflow-hidden px-6 py-24 sm:px-8 lg:px-12 bg-white"
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 -z-10 bg-slate-50/50 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-indigo-100/50 blur-3xl opacity-60" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl opacity-60" />
      </div>

      <div className="relative mx-auto max-w-2xl text-center">
        {/* Headline */}
        <motion.div
           initial={{ opacity: 0, y: 16 }}
           animate={inView ? { opacity: 1, y: 0 } : {}}
           transition={{ duration: 0.5 }}
        >
           <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-600">
             <Sparkles className="w-3 h-3" />
             Early Access
           </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Don't miss out, join the queue
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-slate-600">
              Get priority access to GadgetOS Web Demo, early features, and help
              shape the future of an AI-first operating system.
            </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="
            mx-auto mt-10 max-w-md rounded-2xl
            bg-white p-8
            shadow-xl shadow-indigo-100/50 ring-1 ring-slate-200/60
          "
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="group relative">
                <Input
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all font-medium"
                />
            </div>

            <Button
              size="lg"
              className="
                h-12 w-full rounded-xl
                bg-indigo-600 text-white font-semibold
                hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20
                transition-all duration-300
              "
            >
              Join the waiting list
            </Button>
          </form>

          {/* Social proof */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
             <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-5 w-5 rounded-full border border-white bg-slate-200" />
                ))}
             </div>
             <p>Joined by 200+ developers</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
