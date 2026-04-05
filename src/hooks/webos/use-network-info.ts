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
