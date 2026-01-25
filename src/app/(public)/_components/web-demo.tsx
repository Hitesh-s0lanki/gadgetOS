"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Play, Terminal, Cpu, Layout } from "lucide-react";

export function WebDemo() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section
      id="web-demo"
      ref={ref}
      className="relative overflow-hidden bg-slate-900 py-32"
    >
        {/* Dark Mode Overlay for Contrast with the light rest-of-site */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900 to-slate-900" />
        
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        
        {/* Content Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Text */}
            <motion.div
               initial={{ opacity: 0, x: -20 }}
               animate={inView ? { opacity: 1, x: 0 } : {}}
               transition={{ duration: 0.6 }}
               className="max-w-xl"
            >
                 <div className="inline-flex items-center gap-2 text-indigo-400 font-semibold tracking-wider uppercase text-sm mb-6">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    Interactive Sandbox
                 </div>

                 <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-6">
                    Experience the OS <br /> 
                    <span className="text-indigo-400">Directly in Your Browser</span>
                 </h2>

                 <p className="text-lg text-slate-400 leading-relaxed mb-8">
                    No downloads. No installation. We've compiled the core GadgetOS kernel to WebAssembly so you can try the future of computing right now.
                 </p>

                 <div className="flex flex-col sm:flex-row gap-4">
                     <Button 
                        size="lg" 
                        className="h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-8 text-base shadow-lg shadow-indigo-900/20"
                        asChild
                     >
                        <Link href="/demo" className="flex items-center gap-2">
                             <Play className="w-4 h-4 fill-current" /> Launch Web Demo
                        </Link>
                     </Button>
                     <Button 
                        size="lg" 
                        variant="outline" 
                        className="h-12 border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white rounded-full px-8 text-base"
                        asChild
                     >
                        <Link href="/docs" className="flex items-center gap-2">
                             Read Documentation <ArrowUpRight className="w-4 h-4" />
                        </Link>
                     </Button>
                 </div>

                 <div className="mt-12 flex items-center gap-8 border-t border-slate-800 pt-8">
                      <div className="flex items-center gap-3">
                           <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                               <Terminal className="w-5 h-5" />
                           </div>
                           <div className="text-sm">
                               <p className="text-white font-medium">Auto-Terminal</p>
                               <p className="text-slate-500">AI command execution</p>
                           </div>
                      </div>
                      <div className="flex items-center gap-3">
                           <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                               <Cpu className="w-5 h-5" />
                           </div>
                           <div className="text-sm">
                               <p className="text-white font-medium">WASM Kernel</p>
                               <p className="text-slate-500">Local performance</p>
                           </div>
                      </div>
                 </div>
            </motion.div>

            {/* Right Visual Card */}
             <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={inView ? { opacity: 1, scale: 1 } : {}}
               transition={{ duration: 0.6, delay: 0.2 }}
               className="relative"
            >
                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20 blur-xl rounded-[2rem]" />
                
                <div className="relative rounded-2xl bg-[#0f1117] border border-slate-800 p-2 shadow-2xl">
                     <div className="rounded-xl overflow-hidden bg-slate-900 aspect-video relative flex flex-col">
                          {/* Fake Browser Bar */}
                          <div className="h-8 bg-[#1e222e] border-b border-slate-800 flex items-center px-3 gap-2">
                               <div className="flex gap-1.5">
                                   <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                                   <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20" />
                                   <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                               </div>
                               <div className="mx-auto bg-[#0f1117] px-3 py-0.5 rounded text-[10px] text-slate-500 font-mono">
                                   demo.gadgetos.dev
                               </div>
                          </div>
                          
                          {/* Fake Demo Content */}
                          <div className="flex-1 p-6 relative font-mono text-sm text-slate-300">
                               <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:16px_16px]" />
                               
                               <div className="relative z-10 space-y-2">
                                   <div className="flex gap-2">
                                       <span className="text-green-400">user@gadgetos</span>
                                       <span className="text-slate-500">:</span>
                                       <span className="text-blue-400">~</span>
                                       <span className="text-slate-500">$</span>
                                       <span>create a marketing plan for Q4</span>
                                   </div>
                                   <div className="pl-4 border-l border-slate-700 py-2 space-y-1 text-xs text-slate-400 animate-pulse">
                                       <p>Analyze market trends...</p>
                                       <p>Drafting slide deck structure...</p>
                                       <p>Generating assets...</p>
                                   </div>
                                    <div className="flex gap-2">
                                       <span className="text-green-400">✔</span>
                                       <span className="text-white">Done! Created 'Q4_Plan' directory with 3 files.</span>
                                   </div>
                                   <div className="flex gap-2 pt-2">
                                       <span className="text-green-400">user@gadgetos</span>
                                       <span className="text-slate-500">:</span>
                                       <span className="text-blue-400">~/Q4_Plan</span>
                                       <span className="text-slate-500">$</span>
                                       <span className="w-2 h-4 bg-slate-500 animate-pulse" />
                                   </div>
                               </div>
                               
                               {/* Floating Preview Window */}
                               <motion.div 
                                  initial={{ y: 20, opacity: 0 }}
                                  animate={inView ? { y: 0, opacity: 1 } : {}}
                                  transition={{ delay: 1 }}
                                  className="hidden sm:block absolute bottom-6 right-6 w-48 bg-[#1e222e] rounded-lg border border-slate-700 p-3 shadow-xl"
                               >
                                    <div className="flex items-center gap-2 mb-2 text-xs text-slate-400 border-b border-slate-700 pb-2">
                                        <Layout className="w-3 h-3" /> Preview
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-2 w-3/4 bg-slate-700 rounded full" />
                                        <div className="h-2 w-1/2 bg-slate-700 rounded full" />
                                        <div className="h-16 w-full bg-indigo-500/10 rounded border border-indigo-500/20" />
                                    </div>
                               </motion.div>
                          </div>
                     </div>
                </div>
            </motion.div>
            
        </div>
      </div>
    </section>
  );
}

export default WebDemo;
