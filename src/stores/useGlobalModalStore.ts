"use client";

import { create } from "zustand";

type GlobalModalState = {
  errorMessage: string;
  errorOpen: boolean;
  showError: (message: string) => void;
  hideError: () => void;
  successMessage: string;
  successOpen: boolean;
  goBackOnSuccessClose: boolean;
  showSuccess: (message: string, options?: { goBackOnClose?: boolean }) => void;
  hideSuccess: () => void;
};

export const useGlobalModalStore = create<GlobalModalState>((set) => ({
  errorMessage: "",
  errorOpen: false,
  showError: (message) => set({ errorMessage: message, errorOpen: true }),
  hideError: () => set({ errorMessage: "", errorOpen: false }),
  successMessage: "",
  successOpen: false,
  goBackOnSuccessClose: false,
  showSuccess: (message, options) => set({
    successMessage: message,
    successOpen: true,
    goBackOnSuccessClose: options?.goBackOnClose ?? false,
  }),
  hideSuccess: () => set({ successMessage: "", successOpen: false, goBackOnSuccessClose: false }),
}));
