"use client";

import { create } from "zustand";

type GlobalModalState = {
  errorMessage: string;
  errorOpen: boolean;
  showError: (message: string) => void;
  hideError: () => void;
  successMessage: string;
  successOpen: boolean;
  showSuccess: (message: string) => void;
  hideSuccess: () => void;
};

export const useGlobalModalStore = create<GlobalModalState>((set) => ({
  errorMessage: "",
  errorOpen: false,
  showError: (message) => set({ errorMessage: message, errorOpen: true }),
  hideError: () => set({ errorMessage: "", errorOpen: false }),
  successMessage: "",
  successOpen: false,
  showSuccess: (message) => set({ successMessage: message, successOpen: true }),
  hideSuccess: () => set({ successMessage: "", successOpen: false }),
}));
