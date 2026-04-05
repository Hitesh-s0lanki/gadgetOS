// src/components/webos/desktop/desktop-screen.tsx
"use client";

import { useEffect, useState } from "react";
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import Navbar from "./navbar";
import Taskbar from "./taskbar";
import WindowProvider from "@/components/webos/providers/window-provider";
import { DesktopContextMenu } from "@/components/webos/context-menu";
import { useOsState } from "@/hooks/webos/use-os-state";
import { useBatteryInfo } from "@/hooks/webos/use-battery-info";
import { useNetworkInfo } from "@/hooks/webos/use-network-info";
import { useVoiceControl } from "@/hooks/webos/use-voice-control";

function BrightnessOverlay() {
  const brightness = useOsState((s) => s.brightness);
  const opacity = ((100 - brightness) / 100) * 0.85;
  if (opacity <= 0) return null;
  return (
    <div
      data-html2canvas-ignore="true"
      className="pointer-events-none fixed inset-0 z-[100] bg-black"
      style={{ opacity }}
    />
  );
}

function SleepOverlay() {
  const { isSleeping, setIsSleeping } = useOsState();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    if (!isSleeping) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [isSleeping]);

  if (!isSleeping) return null;

  const display = now ?? new Date();
  const timePart = display.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const datePart = display.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer select-none"
      onClick={() => setIsSleeping(false)}
    >
      <p className="text-8xl font-thin text-white/90 tracking-tight">{timePart}</p>
      <p className="text-xl font-light text-white/50 mt-2">{datePart}</p>
      <p className="mt-12 text-xs tracking-widest text-white/30 animate-pulse uppercase">
        Click anywhere to wake
      </p>
    </div>
  );
}

function ApiHooks() {
  useBatteryInfo();
  useNetworkInfo();
  useVoiceControl();
  return null;
}

export default function DesktopScreen() {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="h-screen w-full bg-[url('/background.svg')] bg-no-repeat bg-center bg-cover relative">
          <ApiHooks />
          <BrightnessOverlay />
          <SleepOverlay />
          <Navbar />
          <WindowProvider />
          <Taskbar />
        </div>
      </ContextMenuTrigger>
      <DesktopContextMenu />
    </ContextMenu>
  );
}
