"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Terminal } from "lucide-react";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      id="hero"
      ref={ref}
      className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-white px-6 pt-24 pb-16 sm:pt-32 sm:px-8 lg:px-12"
    >
      {/* Background Gradients */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[50%] top-[-20%] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-50/80 blur-3xl opacity-60" />
        <div className="absolute right-[0%] top-[40%] h-[400px] w-[400px] rounded-full bg-blue-50/60 blur-3xl opacity-40" />
      </div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />

      <div className="mx-auto max-w-5xl text-center">
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center rounded-full border border-indigo-100 bg-white px-3 py-1 text-sm text-indigo-600 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm"
        >
          <span className="flex items-center gap-1.5 font-semibold tracking-wide uppercase text-[10px]">
             <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
             </span>
             Public Alpha Live
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-slate-900 sm:text-7xl"
        >
          The Operating System <br className="hidden sm:block"/>
          That <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Thinks With You</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-8 max-w-2xl text-lg text-slate-600 leading-relaxed sm:text-xl"
        >
          GadgetOS redefines your relationship with computers. <br className="hidden sm:block" />
          No more rigid files or CLI commands. Just pure intent.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/demo"
            className="group relative inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-900 px-8 text-sm font-semibold text-white shadow-xl shadow-slate-200 transition-all hover:bg-slate-800 hover:ring-4 hover:ring-slate-100"
          >
            <Terminal className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
            <span>Launch Web Demo</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          
          <Link
            href="#early-access"
             className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-8 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
          >
            Join Waitlist
          </Link>
        </motion.div>

        {/* Hero Visual / Code Snippet */}
        <motion.div
           initial={{ opacity: 0, scale: 0.9, y: 40 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           transition={{ duration: 0.8, delay: 0.4 }}
           className="mt-20 relative mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-slate-50/50 p-2 shadow-2xl backdrop-blur-sm"
        >
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
            <div className="rounded-xl overflow-hidden shadow-sm ring-1 ring-slate-200/50">
                 <Image 
                    src="/desktop.png" 
                    alt="GadgetOS Desktop Interface" 
                    width={1920} 
                    height={1080}
                    className="w-full h-auto"
                    priority
                 />
            </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
