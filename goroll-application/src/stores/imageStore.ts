import { create } from "zustand";

type ImageState = {
  imageData: { url: string }[];
  setImageData: (imageData: { url: string }[]) => void;
};

export const useImageStore = create<ImageState>((set) => ({
  imageData: [],
  setImageData: (imageData) => set({ imageData }),
}));
