"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { FolderSearch, Terminal, Mic, CheckCircle2, Sparkles } from "lucide-react";

const FEATURES = [
  {
    category: "Intelligent Storage",
    icon: FolderSearch,
    headline: "Files That Understand Context",
    copy: "Stop thinking in folders and filenames. GadgetOS understands what your files mean, how you use them, and when they matter. Search by intent. Organize automatically.",
    highlights: [
      "AI-assisted file organization",
      "Semantic search by meaning",
      "Smart folder suggestions",
    ],
    // Illustration: A clean file explorer abstraction
    illustration: (
        <div className="relative h-full w-full bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col gap-4 shadow-sm overflow-hidden">
             <div className="flex gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
             </div>
             <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === 1 ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                           <FolderSearch className="w-4 h-4" />
                        </div>
                        <div className="flex-1 space-y-1.5">
                            <div className="w-24 h-2 bg-slate-200 rounded-full"></div>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full"></div>
                        </div>
                        {i === 1 && <div className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">AI Match</div>}
                    </div>
                ))}
             </div>
             {/* Floating Badge */}
             <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur border border-indigo-100 shadow-lg rounded-lg p-3 flex items-center gap-3 animate-pulse">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-semibold text-indigo-900">Scanning content...</span>
             </div>
        </div>
    )
  },
  {
    category: "Natural Workflow",
    icon: Terminal,
    headline: "A Terminal That Speaks Human",
    copy: "Use traditional commands or describe what you want to do. The AI-powered terminal translates intent into execution, explains actions before they run.",
    highlights: [
      "Natural language commands",
      "Command explanation mode",
      "Safe, sandboxed execution",
    ],
    // Illustration: A dark terminal window
    illustration: (
        <div className="relative h-full w-full bg-[#1e1e2e] rounded-2xl border border-slate-800 p-6 shadow-2xl overflow-hidden font-mono text-xs">
             <div className="flex justify-between items-center mb-6 opacity-50">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-slate-400">bash — 80x24</div>
             </div>
             <div className="space-y-4 text-slate-300">
                <div>
                     <span className="text-green-400">➜</span> <span className="text-blue-400">~</span> <span className="text-slate-100">update system and clean logs</span>
                </div>
                <div className="border-l-2 border-indigo-500/50 pl-3 py-1 space-y-1 text-slate-400">
                    <p>I will run:</p>
                    <p className="text-yellow-300">1. sudo apt-get update</p>
                    <p className="text-yellow-300">2. sudo journalctl --vacuum-time=7d</p>
                </div>
                <div>
                    <span className="text-green-400">✔</span> Done in 2.4s
                </div>
                <div className="flex gap-2 items-center">
                    <span className="text-green-400">➜</span> <span className="text-blue-400">~</span> <div className="w-2 h-4 bg-slate-400 animate-pulse"></div>
                </div>
             </div>
        </div>
    )
  },
  {
    category: "Voice Command",
    icon: Mic,
    headline: "Speak. Create. Execute.",
    copy: "Create files, write code, and run tasks using your voice. GadgetOS listens, understands, and confirms critical actions before execution.",
    highlights: [
      "Voice-to-file creation",
      "Code execution automation",
      "AI confirmation layer",
    ],
    // Illustration: Voice visualization
    illustration: (
        <div className="relative h-full w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden flex flex-col items-center justify-center">
             <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-indigo-50/50"></div>
             
             {/* Central Mic */}
             <div className="relative z-10 w-20 h-20 rounded-full bg-indigo-600 shadow-xl shadow-indigo-200 flex items-center justify-center mb-8">
                 <Mic className="w-8 h-8 text-white" />
                 <div className="absolute inset-0 rounded-full border border-white/20 animate-ping"></div>
             </div>

             {/* Waveforms */}
             <div className="relative z-10 flex gap-1 items-end h-16">
                 {[40, 60, 30, 80, 50, 90, 40, 60].map((h, i) => (
                     <div 
                        key={i} 
                        className="w-2 bg-indigo-400 rounded-full"
                        style={{ height: `${h}%`, opacity: 0.6 }}
                     ></div>
                 ))}
             </div>
             
             <div className="relative z-10 mt-8 bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-600">&quot;Create a new project...&quot;</p>
             </div>
        </div>
    )
  },
];

export function Features() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section
      id="features"
      ref={ref}
      className="relative overflow-hidden bg-white px-6 py-24 sm:px-8 lg:px-12"
    >
      {/* Background Decor */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-slate-50/50">
        <div className="absolute right-0 top-0 h-[800px] w-[800px] translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-50/50 blur-3xl opacity-50" />
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
           initial={{ opacity: 0, y: 16 }}
           animate={inView ? { opacity: 1, y: 0 } : {}}
           transition={{ duration: 0.5 }}
           className="text-center mb-24 max-w-3xl mx-auto"
        >
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Features
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Master Your Workflow with <span className="text-indigo-600">Advanced Intelligence</span>
          </h2>
          <p className="mt-6 text-lg text-slate-600">
             Optimise your operations with cutting-edge tools for real-time tracking,
             automated workflows, and seamless operating system integration.
          </p>
        </motion.div>

        {/* Feature List */}
        <div className="space-y-20 sm:space-y-32">
          {FEATURES.map((f, i) => (
            <FeatureRow key={f.headline} feature={f} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureRow({ feature: f, index, inView }: { 
    feature: {
        category: string;
        icon: React.ElementType;
        headline: string;
        copy: string;
        highlights: string[];
        illustration: React.ReactNode;
    }; 
    index: number; 
    inView: boolean 
}) {
    const isEven = index % 2 === 0;

    return (
        <div className={`flex flex-col gap-8 lg:gap-12 lg:flex-row lg:items-center ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
            {/* Text Content */}
            <motion.div 
               className="flex-1 space-y-8"
               initial={{ opacity: 0, x: isEven ? -40 : 40 }}
               animate={inView ? { opacity: 1, x: 0 } : {}}
               transition={{ duration: 0.6, delay: 0.2 }}
            >
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600 shadow-sm">
                    <f.icon className="h-4 w-4 text-indigo-500" />
                    <span>{f.category}</span>
                </div>
                
                <div className="space-y-4">
                    <h3 className="text-3xl font-bold text-slate-900 leading-tight">
                        {f.headline}
                    </h3>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        {f.copy}
                    </p>
                </div>

                <ul className="space-y-4">
                    {f.highlights.map((h: string) => (
                        <li key={h} className="flex items-start gap-3 text-slate-700">
                            <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-indigo-500" />
                            <span className="font-medium">{h}</span>
                        </li>
                    ))}
                </ul>
            </motion.div>

            {/* Visual/Image Content */}
            <motion.div 
                className="flex-1 relative"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
            >
                <div className="aspect-[4/3] w-full rounded-3xl bg-slate-100 p-2 shadow-2xl shadow-indigo-100/50 ring-1 ring-slate-200 overflow-hidden">
                     {f.illustration}
                </div>
                
                {/* Decor elements */}
                <div className={`absolute -bottom-8 -z-10 h-64 w-64 rounded-full bg-indigo-100/50 blur-3xl ${isEven ? '-right-8' : '-left-8'}`} />
            </motion.div>
        </div>
    )
}
export default Features;
