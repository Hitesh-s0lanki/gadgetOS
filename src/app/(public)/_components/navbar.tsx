"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Sparkles } from "lucide-react";

const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "Features", href: "#features" },
  { label: "Web Demo", href: "#web-demo" },
  { label: "Roadmap", href: "#roadmap" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-12">
        {/* Logo */}
        <Link
          href="#hero"
          className="flex items-center gap-2 group transition-opacity hover:opacity-90"
        >
          <Image src="/logo.svg" alt="Logo" height={32} width={32} className="h-8 w-8" />
          <span className="text-lg font-bold tracking-tight text-slate-900">
            GadgetOS
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 md:flex">
          <Link 
            href="/login" 
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Sign In
          </Link>
          <Button size="sm" className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200" asChild>
            <Link href="#early-access">
               Join Waitlist <Sparkles className="ml-2 h-3 w-3 opacity-70" />
            </Link>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="text-slate-600">
              <Menu className="size-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[300px] border-l border-slate-200">
            <SheetHeader className="text-left">
              <SheetTitle className="flex items-center gap-2">
                 <Image src="/logo.svg" alt="Logo" height={32} width={32} className="h-8 w-8" />
                 GadgetOS
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-8 flex flex-col gap-2">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-6 py-3 text-base font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-indigo-600"
                >
                  {label}
                </Link>
              ))}
              <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6">
                <Button variant="outline" size="lg" className="w-full justify-start rounded-xl border-slate-200" asChild>
                  <Link href="/login" onClick={() => setOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button size="lg" className="w-full justify-start rounded-xl bg-indigo-600 hover:bg-indigo-700" asChild>
                  <Link href="#early-access" onClick={() => setOpen(false)}>
                    Join Waitlist
                  </Link>
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
