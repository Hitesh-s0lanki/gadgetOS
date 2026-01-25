"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { MoreHorizontal, Command, Search } from "lucide-react";

export function Product() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      id="product"
      ref={ref}
      className="relative overflow-hidden bg-white px-6 py-24 sm:px-8 lg:px-12"
    >
      {/* Background Decor */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-slate-50 to-white">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-50/80 blur-3xl opacity-60" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left: Content */}
            <motion.div
               className="max-w-xl"
               initial={{ opacity: 0, x: -20 }}
               animate={inView ? { opacity: 1, x: 0 } : {}}
               transition={{ duration: 0.6 }}
            >
                <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-6">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    Live Preview
                </div>
                
                <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-6">
                    The OS that <br />
                    <span className="text-indigo-600">thinks like you</span>
                </h2>
                
                <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                    <p>
                        GadgetOS isn&apos;t just another layer on top of Linux. It&apos;s a fundamental reimagining of how humans and computers interact.
                    </p>
                    <p>
                        By replacing rigid file hierarchies with semantic understanding, and CLI flags with natural conversations, we&apos;re building the first operating system designed for the AI era.
                    </p>
                </div>

                <div className="mt-8 flex gap-4">
                    <div className="flex flex-col gap-1 border-l-2 border-slate-200 pl-4">
                        <span className="text-2xl font-bold text-slate-900">10x</span>
                        <span className="text-sm font-medium text-slate-500">Faster Workflows</span>
                    </div>
                     <div className="flex flex-col gap-1 border-l-2 border-slate-200 pl-4">
                        <span className="text-2xl font-bold text-slate-900">0%</span>
                        <span className="text-sm font-medium text-slate-500">Boilerplate</span>
                    </div>
                </div>
            </motion.div>

            {/* Right: UI Mockup */}
            <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                {/* Fake OS Window */}
                <div className="relative rounded-2xl bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-2xl shadow-indigo-200/40 overflow-hidden">
                    {/* Window Title Bar */}
                    <div className="h-10 bg-white/50 border-b border-slate-200/50 flex items-center justify-between px-4">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <div className="text-xs font-medium text-slate-400 flex items-center gap-2">
                             <Command className="w-3 h-3" /> gadgetos-core
                        </div>
                        <div className="flex gap-2 text-slate-400">
                             <MoreHorizontal className="w-4 h-4" />
                        </div>
                    </div>

                    {/* Window Content */}
                    <div className="p-6 h-[300px] sm:h-[400px] bg-slate-50/30 flex flex-col relative overflow-hidden">
                         
                         {/* Desktop Elements */}
                         <div className="absolute top-6 right-6 hidden sm:flex flex-col gap-4">
                            <div className="w-16 h-20 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-2 p-2 hover:bg-indigo-50 transition-colors cursor-pointer group">
                                <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                    <span className="font-bold text-xs">DOC</span>
                                </div>
                                <span className="text-[10px] font-medium text-slate-600">Projects</span>
                            </div>
                            <div className="w-16 h-20 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-2 p-2 hover:bg-indigo-50 transition-colors cursor-pointer group">
                                <div className="w-10 h-10 bg-amber-100 rounded-md flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                                    <span className="font-bold text-xs">IMG</span>
                                </div>
                                <span className="text-[10px] font-medium text-slate-600">Assets</span>
                            </div>
                         </div>

                         {/* Center Search Bar (Spotlight style) */}
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm">
                             <div className="bg-white/90 backdrop-blur rounded-xl border border-slate-200 shadow-xl p-4 space-y-4">
                                 <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                     <Search className="w-5 h-5 text-indigo-500" />
                                     <span className="text-lg text-slate-400 font-light">What would you like to build?</span>
                                 </div>
                                 <div className="space-y-2">
                                     <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-50 text-indigo-900 text-sm font-medium">
                                         <span>Create a new React project...</span>
                                         <span className="text-xs text-indigo-400">⏎</span>
                                     </div>
                                     <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-slate-600 text-sm">
                                         <span>Analyze logs from yesterday...</span>
                                     </div>
                                 </div>
                             </div>
                         </div>
                         
                         {/* Taskbar */}
                         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 h-14 bg-white/80 backdrop-blur rounded-2xl border border-slate-200 shadow-lg px-4 flex items-center gap-4">
                             {[1,2,3,4].map(i => (
                                 <div key={i} className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-indigo-100 hover:scale-110 transition-all cursor-pointer border border-slate-200"></div>
                             ))}
                         </div>
                    </div>
                </div>
            </motion.div>

        </div>
      </div>
    </section>
  );
}

export default Product;
