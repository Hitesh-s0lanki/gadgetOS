"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function Navbar() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);
  if (!isMounted) return null;

  return (
    <div className="h-8 bg-white/35 backdrop-blur-2xl border-b border-white/50 w-full px-2 py-1 flex justify-between items-center">
      {/* Left: GadgetOS menu */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="h-6 hover:bg-white/30 rounded-md text-sm font-semibold text-black/70 transition-colors duration-150">
            GadgetOS
          </Button>
        </PopoverTrigger>
        <PopoverContent className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-xl ml-3 p-4 w-full" sideOffset={15} side="bottom">
          <div className="flex items-center justify-between">
            <Image src="/icons/shut-down.svg" alt="Shutdown" width={25} height={25} className="bg-white/30 rounded-sm p-1 cursor-pointer hover:bg-white/20" />
            <Image src="/icons/restart.svg" alt="Restart" width={25} height={25} className="bg-white/30 rounded-sm p-1 cursor-pointer hover:bg-white/20" />
            <Image src="/icons/sleep.svg" alt="Sleep" width={25} height={25} className="bg-white/30 rounded-sm p-1 cursor-pointer hover:bg-white/20" />
          </div>
        </PopoverContent>
      </Popover>

      {/* Right: system status */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="h-6 hover:bg-white/30 rounded-md text-sm flex gap-4 transition-colors duration-150">
            <Image src="/icons/wifi.svg" alt="WiFi" width={15} height={15} />
            <Image src="/icons/sound.svg" alt="Sound" width={15} height={15} />
            <Image src="/icons/battery.svg" alt="Battery" width={15} height={15} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="border border-white/60 w-full mr-4 bg-white/70 backdrop-blur-2xl shadow-xl rounded-2xl" sideOffset={15} side="bottom">
          <div className="flex flex-col gap-6 items-center bg-white/50 py-5 px-3 rounded-xl">
            <div className="grid grid-cols-4 gap-4 items-center justify-center">
              {[
                { src: "/icons/wifi.svg", label: "Wi-Fi" },
                { src: "/icons/soundless.svg", label: "Mute" },
                { src: "/icons/screenshot.svg", label: "Screenshot" },
                { src: "/icons/plane-mode.svg", label: "Airplane" },
                { src: "/icons/bluetooth.svg", label: "Bluetooth" },
                { src: "/icons/battery-saver.svg", label: "Power Save" },
              ].map(({ src, label }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <div className="flex items-center justify-center p-2 rounded-full bg-white/60 cursor-pointer hover:bg-white/90 transition-colors duration-150">
                    <Image src={src} alt={label} width={20} height={20} />
                  </div>
                  <p className="text-[10px]">{label}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center w-full px-3 pb-2">
              <Image src="/icons/sun-line.svg" alt="Brightness" width={18} height={18} />
              <Slider defaultValue={[50]} max={100} step={1} className={cn("w-full mx-2")} />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
