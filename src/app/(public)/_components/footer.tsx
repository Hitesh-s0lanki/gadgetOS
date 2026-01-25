"use client";

import Link from "next/link";
import { Github, Twitter } from "lucide-react";

const FOOTER_LINKS = [
  { label: "Roadmap", href: "#roadmap" },
  { label: "Story", href: "#" },
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
];

const SOCIAL_LINKS = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Github, href: "#", label: "GitHub" },
]

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-slate-50 border-t border-slate-200 pt-16 pb-8">
      {/* Background Blobs (lighter/subtle) */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-50" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-0 bottom-0 h-64 w-64 rounded-full bg-indigo-100/40 blur-3xl" />
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-blue-100/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:gap-8">
            {/* Brand Column */}
            <div className="col-span-1 md:col-span-2">
                <Link href="/" className="inline-block">
                    <span className="text-xl font-bold text-slate-900 tracking-tight">GadgetOS</span>
                </Link>
                <p className="mt-4 text-sm text-slate-500 max-w-xs leading-relaxed">
                    The first AI-native operating system designed to blur the line between web and desktop.
                </p>
                <div className="mt-6 flex gap-4">
                    {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                        <Link
                            key={label}
                            href={href}
                            className="rounded-full bg-white p-2 text-slate-500 shadow-sm ring-1 ring-slate-200 hover:text-indigo-600 hover:ring-indigo-200 transition-all"
                            aria-label={label}
                        >
                            <Icon className="h-4 w-4" />
                        </Link>
                    ))}
                </div>
            </div>

            {/* Links Columns */}
            <div className="md:col-span-2 flex flex-col sm:flex-row gap-10 md:justify-end">
                <div>
                    <h3 className="text-sm font-semibold text-slate-900">Product</h3>
                    <ul className="mt-4 space-y-3 text-sm">
                        {FOOTER_LINKS.map(({ label, href }) => (
                            <li key={label}>
                                <Link href={href} className="text-slate-600 hover:text-indigo-600 transition-colors">
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                     <h3 className="text-sm font-semibold text-slate-900">Company</h3>
                     <ul className="mt-4 space-y-3 text-sm">
                         <li><Link href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">About</Link></li>
                         <li><Link href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">Blog</Link></li>
                         <li><Link href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">Careers</Link></li>
                     </ul>
                </div>
            </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 border-t border-slate-200/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
             <p className="text-xs text-slate-500">
                © 2026 GadgetOS. All rights reserved.
             </p>
             <p className="flex items-center gap-1 text-xs text-slate-400">
                <span>Designed with</span>
                <span className="text-indigo-500">●</span>
                <span>for the future</span>
             </p>
        </div>
      </div>
    </footer>
  );
}
