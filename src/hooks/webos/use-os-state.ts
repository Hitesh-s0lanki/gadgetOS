"use client";
// src/hooks/webos/use-os-state.ts
import { create } from "zustand";

export interface BluetoothDeviceInfo {
  id: string;
  name: string;
}

export interface OsState {
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
  previousBrightness: number;

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
  previousBrightness: 100,
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
    set(v
      ? { airplaneModeEnabled: true, wifiEnabled: false, bluetoothEnabled: false }
      : {
          // Turning airplane mode off intentionally does NOT auto-restore wifi/bluetooth.
          // User must re-enable them manually (consistent with mobile OS behavior).
          airplaneModeEnabled: false,
        }
    );
  },
  setBatterySaverEnabled: (v) => {
    set(v
      ? { batterySaverEnabled: true, brightness: 50 }
      : { batterySaverEnabled: false, brightness: get().previousBrightness }
    );
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
    const clamped = Math.max(0, Math.min(100, v));
    set(clamped > 0
      ? { volume: clamped, isMuted: false, previousVolume: clamped }
      : { volume: 0 }
    );
  },
  setBrightness: (v) => {
    const clamped = Math.max(10, Math.min(100, v));
    const { batterySaverEnabled } = get();
    set(batterySaverEnabled
      ? { brightness: clamped }
      : { brightness: clamped, previousBrightness: clamped }
    );
  },
  setIsSleeping: (v) => set({ isSleeping: v }),
  setIsListening: (v) => set({ isListening: v }),
  setBatteryInfo: (level, charging, chargingTime, dischargingTime) =>
    set({ batteryLevel: level, isCharging: charging, chargingTime, dischargingTime }),
  setNetworkInfo: (type, downlink) =>
    set({ networkType: type, networkDownlink: downlink }),
  setBluetoothDevices: (devices) => set({ bluetoothDevices: devices }),
}));
