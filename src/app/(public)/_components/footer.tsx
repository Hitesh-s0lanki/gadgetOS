"use client";

import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Roadmap", href: "#roadmap" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms", href: "#" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden px-4 py-8 sm:px-6">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-100 via-background to-slate-100" />

      {/* Glow accents */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-40 w-[500px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-[-30%] right-[-10%] h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-8 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
          {/* Brand */}
          <div>
            <p className="text-base font-semibold text-black">GadgetOS</p>

            <p className="mt-3 text-xs text-slate-600">
              © 2026 GadgetOS. All rights reserved.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm">
            {FOOTER_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="
                  text-slate-700
                  transition-colors duration-200
                  hover:text-black
                "
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Divider */}
        <div className="mt-10 h-px w-full bg-black/10" />

        {/* Bottom note */}
        <p className="mt-6 text-center text-xs text-slate-600">
          Built for creators, builders, and developers shaping the future.
        </p>
      </div>
    </footer>
  );
}
