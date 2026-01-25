"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Code2, GraduationCap, Palette, Wrench, ArrowRight } from "lucide-react";

const BLOCKS = [
  {
    icon: Code2,
    title: "Developers",
    copy: "Faster workflows, smart terminals, zero config.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: GraduationCap,
    title: "Students",
    copy: "Learn systems through interaction, not memorization.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Palette,
    title: "Creators",
    copy: "Automate repetitive tasks and focus on ideas.",
    color: "bg-pink-50 text-pink-600",
  },
  {
    icon: Wrench,
    title: "Builders",
    copy: "Prototype workflows at the operating system level.",
    color: "bg-purple-50 text-purple-600",
  },
];

export function Users() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section
      id="users"
      ref={ref}
      className="relative border-b border-slate-200 bg-slate-50 px-6 py-24 sm:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
           className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
           initial={{ opacity: 0, y: 12 }}
           animate={inView ? { opacity: 1, y: 0 } : {}}
           transition={{ duration: 0.4 }}
        >
            <div className="max-w-2xl">
                <span className="text-indigo-600 font-semibold tracking-wide uppercase text-sm">Community</span>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Built for the <span className="text-indigo-600">Builders</span>
                </h2>
                <p className="mt-4 text-lg text-slate-600">
                    Whether you&apos;re writing code, designing flows, or learning how computers work, GadgetOS adapts to you.
                </p>
            </div>
            
            <div className="hidden md:block">
                 <button className="group flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                    Read our manifesto <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                 </button>
            </div>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BLOCKS.map((b, i) => (
            <motion.div
              key={b.title}
              className="group relative flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-indigo-100 hover:-translate-y-1"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 * i }}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${b.color}`}>
                <b.icon className="h-6 w-6" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-slate-900">{b.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{b.copy}</p>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-transparent group-hover:ring-indigo-600/10 pointer-events-none transition-all" />
            </motion.div>
          ))}
        </div>
        
        {/* Mobile only link */}
        <div className="mt-8 md:hidden text-center">
             <button className="group inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                Read our manifesto <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
             </button>
        </div>
      </div>
    </section>
  );
}

export default Users;
