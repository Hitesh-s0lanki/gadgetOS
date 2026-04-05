// src/components/webos/desktop/navbar.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useOsState } from "@/hooks/webos/use-os-state";
import ControlCenter from "./control-center";

function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  const datePart = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timePart = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <time className="text-sm font-medium text-black/70 absolute left-1/2 -translate-x-1/2 whitespace-nowrap select-none">
      {datePart}&nbsp;&nbsp;{timePart}
    </time>
  );
}

export default function Navbar() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const wifiEnabled         = useOsState((s) => s.wifiEnabled);
  const airplaneModeEnabled = useOsState((s) => s.airplaneModeEnabled);
  const isMuted             = useOsState((s) => s.isMuted);
  const isListening         = useOsState((s) => s.isListening);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="h-8 bg-white/35 backdrop-blur-2xl border-b border-white/50 w-full px-2 flex items-center justify-between relative">

      {/* Left — GadgetOS menu */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="h-6 px-2 hover:bg-white/30 rounded-md text-sm font-semibold text-black/70"
          >
            GadgetOS
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-xl p-4 w-auto ml-3"
          sideOffset={15}
          side="bottom"
        >
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push("/webos/lock-screen")}
              className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/50 transition-colors duration-150"
              aria-label="Shutdown"
            >
              <Image src="/icons/shut-down.svg" alt="Shutdown" width={24} height={24} />
              <span className="text-[10px] text-black/60">Shutdown</span>
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/50 transition-colors duration-150"
              aria-label="Restart"
            >
              <Image src="/icons/restart.svg" alt="Restart" width={24} height={24} />
              <span className="text-[10px] text-black/60">Restart</span>
            </button>
            <button
              type="button"
              onClick={() => useOsState.getState().setIsSleeping(true)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/50 transition-colors duration-150"
              aria-label="Sleep"
            >
              <Image src="/icons/sleep.svg" alt="Sleep" width={24} height={24} />
              <span className="text-[10px] text-black/60">Sleep</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Center — Live clock */}
      <LiveClock />

      {/* Right — System tray */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="h-6 px-2 hover:bg-white/30 rounded-md flex items-center gap-2"
            aria-label="Control Center"
          >
            <Image
              src="/icons/wifi.svg"
              alt="WiFi"
              width={14}
              height={14}
              className={cn(
                "transition-opacity",
                (!wifiEnabled || airplaneModeEnabled) ? "opacity-30" : "opacity-70"
              )}
            />
            <Image
              src={isMuted ? "/icons/soundless.svg" : "/icons/sound.svg"}
              alt="Sound"
              width={14}
              height={14}
              className="opacity-70"
            />
            <Image
              src="/icons/battery.svg"
              alt="Battery"
              width={14}
              height={14}
              className="opacity-70"
            />
            {isListening && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-xl p-0 mr-4 w-auto max-h-[80vh] overflow-y-auto"
          sideOffset={15}
          side="bottom"
        >
          <ControlCenter />
        </PopoverContent>
      </Popover>

    </div>
  );
}
