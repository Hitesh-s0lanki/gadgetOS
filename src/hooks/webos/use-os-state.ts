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
