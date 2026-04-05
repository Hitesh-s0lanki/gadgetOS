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
      type="button"
      aria-pressed={active}
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
      const current = useOsState.getState().bluetoothDevices;
      if (!current.some((d) => d.id === device.id)) {
        setBluetoothDevices([
          ...current,
          { id: device.id, name: device.name ?? "Unknown device" },
        ]);
      }
    } catch {
      // user cancelled picker — not an error
    } finally {
      setBtScanning(false);
    }
  };

  const handleScreenshot = async () => {
    toast.success("Taking screenshot…");
    try {
      await captureScreenshot();
    } catch {
      toast.error("Screenshot failed");
    }
  };

  const batteryPct = Math.round(batteryLevel * 100);
  const batteryTimeLabel = isCharging
    ? `Charging · ${formatSeconds(chargingTime)} to full`
    : `On battery · ${formatSeconds(dischargingTime)} remaining`;

  return (
    <div className="flex flex-col gap-4 w-72 p-4">

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
        <div className="bg-white/50 rounded-xl p-3 flex flex-col gap-2 text-sm overflow-hidden">
          <p className="text-black/60 truncate">
            {networkType !== "unknown" ? `Connected · ${networkType.toUpperCase()}` : "Status unknown"}
          </p>
          {networkDownlink > 0 && (
            <p className="text-black/40 text-xs">↓ {networkDownlink} Mbps</p>
          )}
          <button
            type="button"
            disabled={airplaneModeEnabled}
            onClick={() => setWifiEnabled(!wifiEnabled)}
            className={cn(
              "mt-1 text-xs rounded-lg px-3 py-1.5 font-medium transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed",
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
        <div className="bg-white/50 rounded-xl p-3 flex flex-col gap-2 text-sm overflow-hidden">
          {bluetoothDevices.length === 0 ? (
            <p className="text-black/40 text-xs">No paired devices</p>
          ) : (
            bluetoothDevices.map((d) => (
              <p key={d.id} className="text-black/60 text-xs truncate">{d.name}</p>
            ))
          )}
          <button
            type="button"
            onClick={handleScanBluetooth}
            disabled={btScanning}
            className="text-xs rounded-lg px-3 py-1.5 font-medium bg-white/60 text-black/60 hover:bg-white/80 transition-colors duration-150 disabled:opacity-50"
          >
            {btScanning ? "Scanning…" : "Scan for devices"}
          </button>
          <button
            type="button"
            disabled={airplaneModeEnabled}
            onClick={() => setBluetoothEnabled(!bluetoothEnabled)}
            className={cn(
              "text-xs rounded-lg px-3 py-1.5 font-medium transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed",
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
