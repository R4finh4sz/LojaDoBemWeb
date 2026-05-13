"use client";

import { create } from "zustand";

type GlobalModalState = {
  errorMessage: string;
  errorOpen: boolean;
  showError: (message: string) => void;
  hideError: () => void;
};

export const useGlobalModalStore = create<GlobalModalState>((set) => ({
  errorMessage: "",
  errorOpen: false,
  showError: (message) => set({ errorMessage: message, errorOpen: true }),
  hideError: () => set({ errorMessage: "", errorOpen: false }),
}));
