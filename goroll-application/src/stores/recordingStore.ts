import { create } from "zustand";

type RecordingState = {
  isRecording: boolean;
  showRecording: boolean;
  frequencyRange: number;
  routeRecord: [number, number][];
  timeDuration: number;
  dateRecording: string;
  setIsRecording: (isRecording: boolean) => void;
  setShowRecording: (showRecording: boolean) => void;
  setFrequencyRange: (frequencyRange: number) => void;
  setRouteRecord: (points: [number, number][]) => void;
  clearRouteRecord: () => void;
  setTimeDuration: (duration: number) => void;
  setDateRecording: (date: string) => void;
};

export const useRecordingStore = create<RecordingState>((set) => ({
  isRecording: false,
  showRecording: false,
  frequencyRange: 20,
  routeRecord: [],
  timeDuration: 0,
  dateRecording: "",
  setIsRecording: (isRecording) => set({ isRecording }),
  setShowRecording: (showRecording) => set({ showRecording }),
  setFrequencyRange: (frequencyRange) => set({ frequencyRange }),
  setRouteRecord: (points) => set({ routeRecord: points }),
  clearRouteRecord: () => set({ routeRecord: [] }),
  setTimeDuration: (duration) => set({ timeDuration: duration }),
  setDateRecording: (date) => set({ dateRecording: date }),
}));
