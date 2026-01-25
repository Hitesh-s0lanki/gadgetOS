"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { CheckCircle2, Circle, CircleDot } from "lucide-react";

const MILESTONES = [
  {
    title: "Web OS Demo",
    date: "Early Access",
    status: "current",
    items: [
      "Browser-based operating environment",
      "Core AI-driven workflows",
    ],
  },
  {
    title: "Extended Web Capabilities",
    date: "2026",
    status: "upcoming",
    items: [
      "Plugins and extensions",
      "Improved AI session memory",
      "Advanced automation flows",
    ],
  },
  {
    title: "Native GadgetOS",
    date: "December 2026",
    status: "future",
    items: [
      "Installable operating system",
      "Full hardware access",
      "Offline-first intelligence",
    ],
  },
];

export default function Roadmap() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      ref={ref}
      id="roadmap"
      className="relative overflow-hidden px-6 py-24 sm:px-8 lg:px-12 bg-white"
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 -z-10 bg-slate-50/50 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-indigo-100/50 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Roadmap
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            The Journey Ahead
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            From a powerful web demo to a fully native AI operating system.
          </p>
        </motion.div>

        {/* Desktop Timeline (Grid Layout) */}
        <div className="hidden md:grid grid-cols-3 gap-x-8 relative">
          
          {/* Timeline Bar Background - Positioned in the middle vertically relative to the grid */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0" />


          {MILESTONES.map((m, i) => {
            const isEven = i % 2 === 0;
            const colStart = [
              "col-start-1",
              "col-start-2",
              "col-start-3",
              "col-start-4",
              "col-start-5",
            ][i];

            return (
              <div key={m.title} className="contents">
                {/* Row 1: Top Content */}
                <div className={`${colStart} row-start-1 pb-10 flex flex-col ${isEven ? 'justify-end' : 'justify-end'}`}>

                  {isEven ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.5, delay: i * 0.2 }}
                      className="relative"
                    >
                       <MilestoneCard milestone={m} />
                       {/* Connector Line */}
                       <div className="absolute left-1/2 -bottom-10 w-px h-10 bg-slate-200 -translate-x-1/2" />
                    </motion.div>
                  ) : (
                    <motion.div
                       initial={{ opacity: 0, y: 20 }}
                       animate={inView ? { opacity: 1, y: 0 } : {}}
                       transition={{ duration: 0.5, delay: i * 0.2 }}
                       className="text-center pb-4"
                    >
                       <span className="text-xl font-bold text-slate-900 block">{m.date}</span>
                       <span className="text-sm font-medium text-indigo-600 uppercase tracking-widest">{m.status}</span>
                    </motion.div>
                  )}
                </div>

                {/* Row 2: The Node on the Line */}
                <div className={`${colStart} row-start-2 flex items-center justify-center relative z-10 my-4 h-8`}>
                   <motion.div
                      initial={{ scale: 0 }}
                      animate={inView ? { scale: 1 } : {}}
                      transition={{ duration: 0.3, delay: i * 0.2 + 0.3 }}
                      className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white ring-4 ring-slate-50 shadow-sm border border-slate-200"
                   >
                       {m.status === 'current' && <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />}
                       <div className={`h-3 w-3 rounded-full ${m.status === 'future' ? 'bg-slate-300' : 'bg-indigo-600'}`} />
                   </motion.div>
                </div>

                {/* Row 3: Bottom Content */}
                <div className={`${colStart} row-start-3 pt-10 flex flex-col ${!isEven ? 'justify-start' : 'justify-start'}`}>
                  {!isEven ? (
                     <motion.div
                     initial={{ opacity: 0, y: -20 }}
                     animate={inView ? { opacity: 1, y: 0 } : {}}
                     transition={{ duration: 0.5, delay: i * 0.2 }}
                     className="relative"
                   >
                     {/* Connector Line */}
                     <div className="absolute left-1/2 -top-10 w-px h-10 bg-slate-200 -translate-x-1/2" />
                     <MilestoneCard milestone={m} />
                   </motion.div>
                  ) : (
                    <motion.div
                       initial={{ opacity: 0, y: -20 }}
                       animate={inView ? { opacity: 1, y: 0 } : {}}
                       transition={{ duration: 0.5, delay: i * 0.2 }}
                       className="text-center pt-4"
                    >
                       <span className="text-xl font-bold text-slate-900 block">{m.date}</span>
                       <span className="text-sm font-medium text-indigo-600 uppercase tracking-widest">{m.status}</span>
                    </motion.div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Timeline (Vertical) */}
        <div className="md:hidden relative border-l-2 border-slate-200 ml-4 space-y-12">
            {MILESTONES.map((milestone, index) => (
                 <motion.div
                 key={index}
                 initial={{ opacity: 0, x: -20 }}
                 animate={inView ? { opacity: 1, x: 0 } : {}}
                 transition={{ duration: 0.5, delay: index * 0.2 }}
                 className="relative pl-8"
               >
                 <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-white ring-4 ring-slate-50 border-2 border-slate-300" />
                 
                 <div className="flex flex-col items-start gap-3">
                     <div>
                        <span className="text-sm font-bold text-indigo-600 uppercase tracking-wider block">{milestone.date}</span>
                        <span className="text-xs text-slate-500 font-medium uppercase">{milestone.status}</span>
                     </div>
                     <MilestoneCard milestone={milestone} className="w-full text-left" />
                 </div>
               </motion.div>
            ))}
        </div>

        {/* Footer */}
        <motion.p
           initial={{ opacity: 0 }}
           animate={inView ? { opacity: 1 } : {}}
           transition={{ delay: 0.8 }}
           className="mt-20 text-center text-sm text-slate-400 max-w-xl mx-auto"
        >
             The Web Demo is just the beginning. GadgetOS evolves into a fully native, AI-first operating system by December 2026.
        </motion.p>
      </div>
    </section>
  );
}

function MilestoneCard({ milestone, className = "" }: { milestone: any; className?: string }) {
    return (
        <div className={`group relative rounded-2xl bg-white p-6 shadow-xl shadow-indigo-100/50 ring-1 ring-slate-200/60 transition-all hover:shadow-2xl hover:shadow-indigo-200/50 hover:-translate-y-1 ${className}`}>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {milestone.title}
            </h3>
            <ul className="mt-4 space-y-2">
                {milestone.items.map((item: string) => (
                    <li key={item} className="flex items-start text-sm text-slate-600">
                        <CheckCircle2 className="mr-2 h-4 w-4 shrink-0 text-indigo-500 mt-0.5" />
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}
