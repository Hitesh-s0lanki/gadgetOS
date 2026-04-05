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

    let cancelled = false;
    let battery: BatteryManager | null = null;

    const onLevel           = () => { if (battery) setBatteryInfo(battery.level, battery.charging, battery.chargingTime, battery.dischargingTime); };
    const onCharging        = () => { if (battery) setBatteryInfo(battery.level, battery.charging, battery.chargingTime, battery.dischargingTime); };
    const onChargingTime    = () => { if (battery) setBatteryInfo(battery.level, battery.charging, battery.chargingTime, battery.dischargingTime); };
    const onDischargingTime = () => { if (battery) setBatteryInfo(battery.level, battery.charging, battery.chargingTime, battery.dischargingTime); };

    (navigator as unknown as { getBattery: () => Promise<BatteryManager> })
      .getBattery()
      .then((b) => {
        if (cancelled) return;
        battery = b;
        setBatteryInfo(b.level, b.charging, b.chargingTime, b.dischargingTime);
        b.addEventListener("levelchange",          onLevel);
        b.addEventListener("chargingchange",       onCharging);
        b.addEventListener("chargingtimechange",   onChargingTime);
        b.addEventListener("dischargingtimechange", onDischargingTime);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (!battery) return;
      battery.removeEventListener("levelchange",           onLevel);
      battery.removeEventListener("chargingchange",        onCharging);
      battery.removeEventListener("chargingtimechange",    onChargingTime);
      battery.removeEventListener("dischargingtimechange", onDischargingTime);
    };
  }, [setBatteryInfo]);
}
