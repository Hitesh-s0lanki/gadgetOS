# WebOS Navbar Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static WebOS navbar with a fully functional three-zone menu bar — live clock, working Control Center (battery, network, Bluetooth, volume, brightness, voice), sleep overlay, and brightness overlay.

**Architecture:** A single Zustand `useOsState` store holds all OS-level state. Three browser-API hooks (`useBatteryInfo`, `useNetworkInfo`, `useVoiceControl`) are mounted in `desktop-screen.tsx` and write real data into that store. The navbar reads from the store. Brightness and sleep overlays sit at the desktop level so they cover the entire screen.

**Tech Stack:** Next.js 15 App Router, TypeScript, Zustand, Tailwind CSS 4, shadcn/ui (Slider, Popover), Sonner (toasts), Web Speech API, Web Bluetooth API, Battery Status API, Network Information API, html2canvas

---

## File Map

| File | Status | Responsibility |
|---|---|---|
| `src/hooks/webos/use-os-state.ts` | **New** | Zustand store — all OS toggle/slider/overlay/live-data state |
| `src/hooks/webos/use-battery-info.ts` | **New** | Reads `navigator.getBattery()`, writes to `useOsState` |
| `src/hooks/webos/use-network-info.ts` | **New** | Reads `navigator.connection`, writes to `useOsState` |
| `src/hooks/webos/use-voice-control.ts` | **New** | SpeechRecognition loop, command dispatch, AI fallback |
| `src/lib/screenshot.ts` | **New** | `captureScreenshot()` — html2canvas → file download |
| `src/components/webos/desktop/control-center.tsx` | **New** | Control Center popover panel |
| `src/components/webos/desktop/navbar.tsx` | **Rewrite** | 3-zone layout: GadgetOS menu · live clock · system tray |
| `src/components/webos/desktop/desktop-screen.tsx` | **Edit** | Mount API hooks, add `<BrightnessOverlay>`, `<SleepOverlay>` |

---

## Task 1: Install html2canvas

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the package**

```bash
cd /Users/Hemant/Desktop/projects/gadgetos
npm install html2canvas
```

Expected: `html2canvas` appears in `package.json` dependencies.

- [ ] **Step 2: Verify TypeScript types resolve**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: zero new errors (html2canvas ships its own types).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install html2canvas for desktop screenshot"
```

---

## Task 2: Create the OS State Store

**Files:**
- Create: `src/hooks/webos/use-os-state.ts`

- [ ] **Step 1: Create the file**

```ts
// src/hooks/webos/use-os-state.ts
import { create } from "zustand";

export interface BluetoothDeviceInfo {
  id: string;
  name: string;
}

interface OsState {
  // Toggles
  wifiEnabled: boolean;
  bluetoothEnabled: boolean;
  airplaneModeEnabled: boolean;
  batterySaverEnabled: boolean;
  isMuted: boolean;

  // Sliders
  volume: number;
  previousVolume: number;
  brightness: number;

  // Overlays
  isSleeping: boolean;

  // Voice
  isListening: boolean;

  // Live data — populated by browser API hooks
  batteryLevel: number;
  isCharging: boolean;
  chargingTime: number;
  dischargingTime: number;
  networkType: string;
  networkDownlink: number;
  bluetoothDevices: BluetoothDeviceInfo[];

  // Actions
  setWifiEnabled: (v: boolean) => void;
  setBluetoothEnabled: (v: boolean) => void;
  setAirplaneModeEnabled: (v: boolean) => void;
  setBatterySaverEnabled: (v: boolean) => void;
  toggleMute: () => void;
  setVolume: (v: number) => void;
  setBrightness: (v: number) => void;
  setIsSleeping: (v: boolean) => void;
  setIsListening: (v: boolean) => void;
  setBatteryInfo: (
    level: number,
    charging: boolean,
    chargingTime: number,
    dischargingTime: number
  ) => void;
  setNetworkInfo: (type: string, downlink: number) => void;
  setBluetoothDevices: (devices: BluetoothDeviceInfo[]) => void;
}

export const useOsState = create<OsState>((set, get) => ({
  wifiEnabled: true,
  bluetoothEnabled: true,
  airplaneModeEnabled: false,
  batterySaverEnabled: false,
  isMuted: false,
  volume: 70,
  previousVolume: 70,
  brightness: 100,
  isSleeping: false,
  isListening: false,
  batteryLevel: 1,
  isCharging: false,
  chargingTime: Infinity,
  dischargingTime: Infinity,
  networkType: "unknown",
  networkDownlink: 0,
  bluetoothDevices: [],

  setWifiEnabled: (v) => set({ wifiEnabled: v }),
  setBluetoothEnabled: (v) => set({ bluetoothEnabled: v }),
  setAirplaneModeEnabled: (v) => {
    set({ airplaneModeEnabled: v });
    if (v) set({ wifiEnabled: false, bluetoothEnabled: false });
  },
  setBatterySaverEnabled: (v) => {
    set({ batterySaverEnabled: v });
    if (v) set({ brightness: 50 });
  },
  toggleMute: () => {
    const { isMuted, volume, previousVolume } = get();
    if (isMuted) {
      set({ isMuted: false, volume: previousVolume });
    } else {
      set({ isMuted: true, previousVolume: volume, volume: 0 });
    }
  },
  setVolume: (v) => {
    set({ volume: v });
    if (v > 0) set({ isMuted: false, previousVolume: v });
  },
  setBrightness: (v) => set({ brightness: v }),
  setIsSleeping: (v) => set({ isSleeping: v }),
  setIsListening: (v) => set({ isListening: v }),
  setBatteryInfo: (level, charging, chargingTime, dischargingTime) =>
    set({ batteryLevel: level, isCharging: charging, chargingTime, dischargingTime }),
  setNetworkInfo: (type, downlink) =>
    set({ networkType: type, networkDownlink: downlink }),
  setBluetoothDevices: (devices) => set({ bluetoothDevices: devices }),
}));
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit 2>&1 | grep "use-os-state"
```

Expected: no output (no errors in this file).

- [ ] **Step 3: Commit**

```bash
git add src/hooks/webos/use-os-state.ts
git commit -m "feat: add useOsState Zustand store for OS-level state"
```

---

## Task 3: Create Battery Info Hook

**Files:**
- Create: `src/hooks/webos/use-battery-info.ts`

- [ ] **Step 1: Create the file**

```ts
// src/hooks/webos/use-battery-info.ts
"use client";

import { useEffect } from "react";
import { useOsState } from "./use-os-state";

// BatteryManager is not in lib.dom.d.ts for all TS versions — define it locally
interface BatteryManager extends EventTarget {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}

export function useBatteryInfo() {
  const setBatteryInfo = useOsState((s) => s.setBatteryInfo);

  useEffect(() => {
    if (!("getBattery" in navigator)) return;

    let battery: BatteryManager | null = null;

    const update = (b: BatteryManager) => {
      setBatteryInfo(b.level, b.charging, b.chargingTime, b.dischargingTime);
    };

    (navigator as unknown as { getBattery: () => Promise<BatteryManager> })
      .getBattery()
      .then((b) => {
        battery = b;
        update(b);
        b.addEventListener("levelchange", () => update(b));
        b.addEventListener("chargingchange", () => update(b));
        b.addEventListener("chargingtimechange", () => update(b));
        b.addEventListener("dischargingtimechange", () => update(b));
      })
      .catch(() => {
        // API not available — defaults remain in store
      });

    return () => {
      if (!battery) return;
      battery.removeEventListener("levelchange", () => {});
      battery.removeEventListener("chargingchange", () => {});
      battery.removeEventListener("chargingtimechange", () => {});
      battery.removeEventListener("dischargingtimechange", () => {});
    };
  }, [setBatteryInfo]);
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "use-battery-info"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/webos/use-battery-info.ts
git commit -m "feat: add useBatteryInfo hook — reads navigator.getBattery()"
```

---

## Task 4: Create Network Info Hook

**Files:**
- Create: `src/hooks/webos/use-network-info.ts`

- [ ] **Step 1: Create the file**

```ts
// src/hooks/webos/use-network-info.ts
"use client";

import { useEffect } from "react";
import { useOsState } from "./use-os-state";

interface NetworkInformation extends EventTarget {
  effectiveType: string;
  downlink: number;
}

export function useNetworkInfo() {
  const setNetworkInfo = useOsState((s) => s.setNetworkInfo);

  useEffect(() => {
    const conn = (
      navigator as unknown as { connection?: NetworkInformation }
    ).connection;

    if (!conn) return;

    const update = () => {
      setNetworkInfo(conn.effectiveType ?? "unknown", conn.downlink ?? 0);
    };

    update();
    conn.addEventListener("change", update);
    return () => conn.removeEventListener("change", update);
  }, [setNetworkInfo]);
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "use-network-info"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/webos/use-network-info.ts
git commit -m "feat: add useNetworkInfo hook — reads navigator.connection"
```

---

## Task 5: Create Screenshot Utility

**Files:**
- Create: `src/lib/screenshot.ts`

- [ ] **Step 1: Create the file**

```ts
// src/lib/screenshot.ts
import html2canvas from "html2canvas";

export async function captureScreenshot(): Promise<void> {
  const canvas = await html2canvas(document.body, {
    useCORS: true,
    allowTaint: false,
    scale: window.devicePixelRatio,
  });
  const link = document.createElement("a");
  link.download = `gadgetos-${Date.now()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "screenshot"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/lib/screenshot.ts
git commit -m "feat: add captureScreenshot utility using html2canvas"
```

---

## Task 6: Create Voice Control Hook

**Files:**
- Create: `src/hooks/webos/use-voice-control.ts`

- [ ] **Step 1: Create the file**

```ts
// src/hooks/webos/use-voice-control.ts
"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useOsState } from "./use-os-state";
import { useTerminal } from "./use-terminal";
import { useBrowser } from "./use-browser";
import { useFileExplorer } from "./use-file-explorer";
import { useSettings } from "./use-settings";
import { useClock } from "./use-clock";
import { useTextEditor } from "./use-text-editor";
import { useTrashBin } from "./use-trash-bin";
import { captureScreenshot } from "@/lib/screenshot";

export function useVoiceControl() {
  const router = useRouter();
  const {
    isListening,
    setIsListening,
    setIsSleeping,
    setVolume,
    setBrightness,
    toggleMute,
    volume,
    brightness,
  } = useOsState();

  const handleTranscript = useCallback(
    async (transcript: string) => {
      const t = transcript.toLowerCase().trim();

      // Pass 1 — keyword matching
      if (t.includes("open terminal")) {
        useTerminal.getState().onOpen();
        toast.success("Opening Terminal");
        return;
      }
      if (t.includes("open browser")) {
        useBrowser.getState().onOpen();
        toast.success("Opening Browser");
        return;
      }
      if (t.includes("open files") || t.includes("open file explorer")) {
        useFileExplorer.getState().onOpen();
        toast.success("Opening File Explorer");
        return;
      }
      if (t.includes("open settings")) {
        useSettings.getState().onOpen();
        toast.success("Opening Settings");
        return;
      }
      if (t.includes("open clock")) {
        useClock.getState().onOpen();
        toast.success("Opening Clock");
        return;
      }
      if (t.includes("open editor") || t.includes("open text editor")) {
        useTextEditor.getState().onOpen();
        toast.success("Opening Text Editor");
        return;
      }
      if (t.includes("open trash")) {
        useTrashBin.getState().onOpen();
        toast.success("Opening Trash");
        return;
      }
      if (t.includes("lock") || t.includes("sleep")) {
        setIsSleeping(true);
        toast.success("Sleeping");
        return;
      }
      if (t.includes("shutdown")) {
        router.push("/webos/lock-screen");
        return;
      }
      if (t.includes("restart")) {
        window.location.reload();
        return;
      }
      if (t.includes("unmute")) {
        useOsState.getState().setVolume(useOsState.getState().previousVolume || 70);
        toast.success("Unmuted");
        return;
      }
      if (t.includes("mute")) {
        toggleMute();
        toast.success("Muted");
        return;
      }
      if (t.includes("volume up")) {
        setVolume(Math.min(100, volume + 10));
        toast.success("Volume up");
        return;
      }
      if (t.includes("volume down")) {
        setVolume(Math.max(0, volume - 10));
        toast.success("Volume down");
        return;
      }
      if (t.includes("screenshot")) {
        toast.success("Taking screenshot…");
        await captureScreenshot();
        return;
      }
      if (t.includes("brightness up")) {
        setBrightness(Math.min(100, brightness + 10));
        toast.success("Brightness up");
        return;
      }
      if (t.includes("brightness down")) {
        setBrightness(Math.max(10, brightness - 10));
        toast.success("Brightness down");
        return;
      }

      // Pass 2 — AI fallback
      try {
        const res = await fetch("/api/openai-terminal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command: transcript }),
        });
        const data = (await res.json()) as { answer?: string; error?: string };
        if (data.answer) {
          toast.info(data.answer, { duration: 6000 });
        } else if (data.error) {
          toast.error(data.error);
        }
      } catch {
        toast.error("Voice AI fallback failed");
      }
    },
    [router, setIsSleeping, setVolume, setBrightness, toggleMute, volume, brightness]
  );

  useEffect(() => {
    const SR =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognition })
        .SpeechRecognition ??
      (
        window as unknown as {
          webkitSpeechRecognition?: new () => SpeechRecognition;
        }
      ).webkitSpeechRecognition;

    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      void handleTranscript(transcript);
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === "not-allowed") {
        toast.error("Microphone access denied. Enable it in browser settings.");
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      if (useOsState.getState().isListening) {
        recognition.start();
      }
    };

    if (isListening) {
      recognition.start();
    }

    return () => {
      recognition.abort();
    };
  }, [isListening, handleTranscript, setIsListening]);
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "use-voice-control"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/webos/use-voice-control.ts
git commit -m "feat: add useVoiceControl hook — Web Speech API + AI fallback"
```

---

## Task 7: Create Control Center Component

**Files:**
- Create: `src/components/webos/desktop/control-center.tsx`

- [ ] **Step 1: Create the file**

```tsx
// src/components/webos/desktop/control-center.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, Mic, MicOff } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useOsState } from "@/hooks/webos/use-os-state";
import { captureScreenshot } from "@/lib/screenshot";
import { cn } from "@/lib/utils";

// ─── helpers ────────────────────────────────────────────────────────────────

function formatSeconds(seconds: number): string {
  if (!isFinite(seconds)) return "Calculating…";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// ─── Toggle tile ─────────────────────────────────────────────────────────────

interface TileProps {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  expandable?: boolean;
  expanded?: boolean;
}

function Tile({ active, label, icon, onClick, expandable, expanded }: TileProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-1 rounded-2xl p-3 w-full transition-colors duration-150",
        active
          ? "bg-indigo-500 text-white"
          : "bg-white/60 text-black/70 hover:bg-white/80"
      )}
    >
      <div className="flex items-center justify-between w-full">
        <div className="w-5 h-5">{icon}</div>
        {expandable && (
          <ChevronDown
            className={cn(
              "w-3 h-3 transition-transform duration-150",
              expanded ? "rotate-180" : "",
              active ? "text-white/70" : "text-black/40"
            )}
          />
        )}
      </div>
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </button>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function ControlCenter() {
  const {
    wifiEnabled, setWifiEnabled,
    bluetoothEnabled, setBluetoothEnabled,
    airplaneModeEnabled, setAirplaneModeEnabled,
    batterySaverEnabled, setBatterySaverEnabled,
    isMuted, toggleMute,
    volume, setVolume,
    brightness, setBrightness,
    isListening, setIsListening,
    batteryLevel, isCharging, chargingTime, dischargingTime,
    networkType, networkDownlink,
    bluetoothDevices, setBluetoothDevices,
  } = useOsState();

  const [wifiExpanded, setWifiExpanded] = useState(false);
  const [btExpanded, setBtExpanded] = useState(false);
  const [btScanning, setBtScanning] = useState(false);

  const handleScanBluetooth = async () => {
    if (!("bluetooth" in navigator)) {
      toast.error("Bluetooth scanning not supported in this browser.");
      return;
    }
    setBtScanning(true);
    try {
      const device = await (
        navigator as unknown as {
          bluetooth: { requestDevice: (o: object) => Promise<{ id: string; name?: string }> };
        }
      ).bluetooth.requestDevice({ acceptAllDevices: true });
      setBluetoothDevices([
        ...bluetoothDevices,
        { id: device.id, name: device.name ?? "Unknown device" },
      ]);
    } catch {
      // user cancelled picker — not an error
    } finally {
      setBtScanning(false);
    }
  };

  const handleScreenshot = async () => {
    toast.success("Taking screenshot…");
    await captureScreenshot();
  };

  const batteryPct = Math.round(batteryLevel * 100);
  const batteryTimeLabel = isCharging
    ? `Charging · ${formatSeconds(chargingTime)} to full`
    : `On battery · ${formatSeconds(dischargingTime)} remaining`;

  return (
    <div className="flex flex-col gap-4 w-72">

      {/* Row 1 — Expandable tiles */}
      <div className="grid grid-cols-2 gap-3">
        <Tile
          active={wifiEnabled}
          label="Wi-Fi"
          expandable
          expanded={wifiExpanded}
          icon={
            <Image src="/icons/wifi.svg" alt="Wi-Fi" width={20} height={20}
              className={cn("w-5 h-5", !wifiEnabled && "opacity-40")} />
          }
          onClick={() => setWifiExpanded((v) => !v)}
        />
        <Tile
          active={bluetoothEnabled}
          label="Bluetooth"
          expandable
          expanded={btExpanded}
          icon={
            <Image src="/icons/bluetooth.svg" alt="Bluetooth" width={20} height={20}
              className={cn("w-5 h-5", !bluetoothEnabled && "opacity-40")} />
          }
          onClick={() => setBtExpanded((v) => !v)}
        />
      </div>

      {/* Wi-Fi expanded */}
      {wifiExpanded && (
        <div className="bg-white/50 rounded-xl p-3 flex flex-col gap-2 text-sm">
          <p className="text-black/60">
            {networkType !== "unknown" ? `Connected · ${networkType.toUpperCase()}` : "Status unknown"}
          </p>
          {networkDownlink > 0 && (
            <p className="text-black/40 text-xs">↓ {networkDownlink} Mbps</p>
          )}
          <button
            onClick={() => setWifiEnabled(!wifiEnabled)}
            className={cn(
              "mt-1 text-xs rounded-lg px-3 py-1.5 font-medium transition-colors duration-150",
              wifiEnabled
                ? "bg-indigo-500 text-white hover:bg-indigo-600"
                : "bg-white/60 text-black/60 hover:bg-white/80"
            )}
          >
            {wifiEnabled ? "Turn Off Wi-Fi" : "Turn On Wi-Fi"}
          </button>
        </div>
      )}

      {/* Bluetooth expanded */}
      {btExpanded && (
        <div className="bg-white/50 rounded-xl p-3 flex flex-col gap-2 text-sm">
          {bluetoothDevices.length === 0 ? (
            <p className="text-black/40 text-xs">No paired devices</p>
          ) : (
            bluetoothDevices.map((d) => (
              <p key={d.id} className="text-black/60 text-xs">{d.name}</p>
            ))
          )}
          <button
            onClick={handleScanBluetooth}
            disabled={btScanning}
            className="text-xs rounded-lg px-3 py-1.5 font-medium bg-white/60 text-black/60 hover:bg-white/80 transition-colors duration-150 disabled:opacity-50"
          >
            {btScanning ? "Scanning…" : "Scan for devices"}
          </button>
          <button
            onClick={() => setBluetoothEnabled(!bluetoothEnabled)}
            className={cn(
              "text-xs rounded-lg px-3 py-1.5 font-medium transition-colors duration-150",
              bluetoothEnabled
                ? "bg-indigo-500 text-white hover:bg-indigo-600"
                : "bg-white/60 text-black/60 hover:bg-white/80"
            )}
          >
            {bluetoothEnabled ? "Turn Off Bluetooth" : "Turn On Bluetooth"}
          </button>
        </div>
      )}

      {/* Row 2 — Simple toggle tiles */}
      <div className="grid grid-cols-3 gap-3">
        <Tile
          active={isMuted}
          label="Mute"
          icon={
            <Image
              src={isMuted ? "/icons/soundless.svg" : "/icons/sound.svg"}
              alt="Mute" width={20} height={20} className="w-5 h-5"
            />
          }
          onClick={toggleMute}
        />
        <Tile
          active={false}
          label="Screenshot"
          icon={
            <Image src="/icons/screenshot.svg" alt="Screenshot" width={20} height={20} className="w-5 h-5" />
          }
          onClick={handleScreenshot}
        />
        <Tile
          active={airplaneModeEnabled}
          label="Airplane"
          icon={
            <Image src="/icons/plane-mode.svg" alt="Airplane" width={20} height={20} className="w-5 h-5" />
          }
          onClick={() => setAirplaneModeEnabled(!airplaneModeEnabled)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Tile
          active={batterySaverEnabled}
          label="Power Save"
          icon={
            <Image src="/icons/battery-saver.svg" alt="Battery Saver" width={20} height={20} className="w-5 h-5" />
          }
          onClick={() => setBatterySaverEnabled(!batterySaverEnabled)}
        />
        <Tile
          active={isListening}
          label={isListening ? "Listening…" : "Voice"}
          icon={isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          onClick={() => setIsListening(!isListening)}
        />
      </div>

      {/* Sliders */}
      <div className="flex flex-col gap-3 px-1">
        <div className="flex items-center gap-3">
          <Image src="/icons/sun-line.svg" alt="Brightness" width={16} height={16} className="shrink-0" />
          <Slider
            value={[brightness]}
            onValueChange={([v]) => setBrightness(v)}
            min={10}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="text-xs text-black/50 w-8 text-right">{brightness}%</span>
        </div>
        <div className="flex items-center gap-3">
          <Image src="/icons/sound.svg" alt="Volume" width={16} height={16} className="shrink-0" />
          <Slider
            value={[volume]}
            onValueChange={([v]) => setVolume(v)}
            min={0}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="text-xs text-black/50 w-8 text-right">{volume}%</span>
        </div>
      </div>

      {/* Battery row */}
      <div className="flex items-center gap-3 bg-white/50 rounded-xl px-3 py-2">
        <Image src="/icons/battery.svg" alt="Battery" width={20} height={20} />
        <div className="flex flex-col">
          <span className="text-xs font-medium text-black/70">{batteryPct}%</span>
          <span className="text-[10px] text-black/40">{batteryTimeLabel}</span>
        </div>
      </div>

    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "control-center"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/webos/desktop/control-center.tsx
git commit -m "feat: add ControlCenter popover panel component"
```

---

## Task 8: Rewrite Navbar

**Files:**
- Rewrite: `src/components/webos/desktop/navbar.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
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

  const { wifiEnabled, airplaneModeEnabled, isMuted, isListening } = useOsState();

  useEffect(() => {
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
              onClick={() => router.push("/webos/lock-screen")}
              className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/50 transition-colors duration-150"
              aria-label="Shutdown"
            >
              <Image src="/icons/shut-down.svg" alt="Shutdown" width={24} height={24} />
              <span className="text-[10px] text-black/60">Shutdown</span>
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/50 transition-colors duration-150"
              aria-label="Restart"
            >
              <Image src="/icons/restart.svg" alt="Restart" width={24} height={24} />
              <span className="text-[10px] text-black/60">Restart</span>
            </button>
            <button
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
          className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-xl p-4 mr-4"
          sideOffset={15}
          side="bottom"
        >
          <ControlCenter />
        </PopoverContent>
      </Popover>

    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "navbar"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/webos/desktop/navbar.tsx
git commit -m "feat: rewrite Navbar — 3-zone layout, live clock, control center trigger"
```

---

## Task 9: Update Desktop Screen — Overlays + API Hooks

**Files:**
- Modify: `src/components/webos/desktop/desktop-screen.tsx`

- [ ] **Step 1: Replace the file content**

```tsx
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
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [isSleeping]);

  if (!isSleeping) return null;

  const timePart = now?.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }) ?? "";
  const datePart = now?.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }) ?? "";

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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep "desktop-screen"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/webos/desktop/desktop-screen.tsx
git commit -m "feat: add BrightnessOverlay, SleepOverlay, and API hooks to DesktopScreen"
```

---

## Task 10: End-to-End Verification

- [ ] **Step 1: Run the dev server**

```bash
npm run dev
```

Navigate to `http://localhost:3000/webos`

- [ ] **Step 2: Verify live clock**

Expected: center of navbar shows e.g. `Sat Apr 5  2:34 PM` and updates every second.

- [ ] **Step 3: Verify GadgetOS menu**

Click "GadgetOS" → popover shows Shutdown / Restart / Sleep with icons and labels.
- Click **Sleep** → full-screen black overlay appears with clock and "CLICK ANYWHERE TO WAKE" — clicking dismisses it.
- Click **Shutdown** → navigates to `/webos/lock-screen`.
- Click **Restart** → page reloads.

- [ ] **Step 4: Verify Control Center**

Click system tray (right side icons):
- Panel opens with Wi-Fi and Bluetooth tiles, toggle tiles, sliders, battery row.
- **Brightness slider** → dragging left dims the entire desktop screen.
- **Volume slider** → value updates in real-time.
- **Mute tile** → icon switches to soundless, volume reads 0.
- **Airplane tile** → turns on, Wi-Fi tile goes inactive.
- **Battery row** → shows real percentage if on a laptop (Chrome/Edge). Shows "Calculating…" on desktops or Firefox.
- **Network** → expand Wi-Fi tile → shows connection type (e.g. `4G`, `WIFI`) and downlink speed on Chrome.
- **Screenshot tile** → downloads a PNG of the desktop.

- [ ] **Step 5: Verify Voice Control (Chrome only)**

Click the Voice tile → browser asks for mic permission → grant it → pulsing red dot appears in navbar.
- Say `"open terminal"` → Terminal window opens, toast says "Opening Terminal".
- Say `"brightness down"` → desktop dims slightly.
- Say `"sleep"` → sleep overlay appears.
- Say something unrecognized (e.g. `"what is the weather"`) → AI response appears as a toast.

- [ ] **Step 6: Full TypeScript check**

```bash
npx tsc --noEmit 2>&1
```

Expected: zero errors introduced by this feature.

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "feat: complete WebOS navbar overhaul — live clock, control center, voice control, overlays"
```
