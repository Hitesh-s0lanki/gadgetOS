import { create } from "zustand";

export interface PendingFile {
  name: string;
  content: string;
}

export interface TextEditorStore {
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  pendingFile: PendingFile | null;
  onOpen: (file?: PendingFile) => void;
  onClose: () => void;
  onMinimize: () => void;
  clearPendingFile: () => void;
}

export const useTextEditor = create<TextEditorStore>((set) => ({
  title: "Text Editor",
  isOpen: false,
  isMinimized: false,
  zIndex: 50,
  pendingFile: null,
  onOpen: (file) =>
    set({ isOpen: true, isMinimized: false, pendingFile: file ?? null }),
  onClose: () => set({ isOpen: false, isMinimized: false, pendingFile: null }),
  onMinimize: () => set({ isMinimized: true }),
  clearPendingFile: () => set({ pendingFile: null }),
}));
