"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Image from "next/image";

const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "Web Demo", href: "#web-demo" },
  { label: "Features", href: "#features" },
  { label: "Roadmap", href: "#roadmap" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header
      id="navbar"
      className="fixed top-0 left-0 right-0 z-50 w-full bg-transparent  "
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 border-b border-border/60">
        <Link
          href="#hero"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground transition-opacity hover:opacity-90"
        >
          <Image src="/logo.svg" alt="Logo" height={25} width={25} />
          GadgetOS
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
            asChild
          >
            <Link href="/demo">Try Demo</Link>
          </Button>
          <Button size="sm" className="rounded-full" asChild>
            <Link href="#early-access">Join List</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="size-5" aria-hidden />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <SheetHeader>
                <SheetTitle>GadgetOS</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {NAV_LINKS.map(({ label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {label}
                  </Link>
                ))}
                <div className="mt-4 flex flex-col gap-2 border-t pt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/demo" onClick={() => setOpen(false)}>
                      Try Demo
                    </Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="#early-access" onClick={() => setOpen(false)}>
                      Join List
                    </Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
