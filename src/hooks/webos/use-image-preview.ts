import { create } from "zustand";

export interface ImagePreviewStore {
  isOpen: boolean;
  url: string;
  onOpen: (url: string) => void;
  onClose: () => void;
}

export const useImagePreview = create<ImagePreviewStore>((set) => ({
  isOpen: false,
  url: "",
  onOpen: (url: string) => set({ isOpen: true, url }),
  onClose: () => set({ isOpen: false, url: "" }),
}));
