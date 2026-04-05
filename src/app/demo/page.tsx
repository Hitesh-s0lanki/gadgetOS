"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DemoPage() {
  const router = useRouter();

  useEffect(() => {
    if (window.innerWidth > 768) {
      router.replace("/webos/lock-screen");
    }
  }, [router]);

  // On desktop the redirect fires immediately; this UI is only seen on mobile.
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400">
            <Monitor className="w-12 h-12" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-white">
            Desktop Only
          </h1>
          <p className="text-slate-400 leading-relaxed">
            GadgetOS Web Demo is designed for desktop browsers. Please visit
            on a laptop or desktop computer for the full experience.
          </p>
        </div>

        <Button
          asChild
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-8"
        >
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </main>
  );
}
