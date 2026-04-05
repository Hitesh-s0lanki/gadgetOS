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
