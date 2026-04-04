import { create } from "zustand";

export interface WindowStore {
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  onOpen: () => void;
  onClose: () => void;
  onMinimize: () => void;
}

export function createWindowStore(title: string) {
  return create<WindowStore>((set) => ({
    title,
    isOpen: false,
    isMinimized: false,
    zIndex: 50,
    onOpen: () => set({ isOpen: true, isMinimized: false }),
    onClose: () => set({ isOpen: false, isMinimized: false }),
    onMinimize: () => set({ isMinimized: true }),
  }));
}
