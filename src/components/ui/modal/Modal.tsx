"use client";

import React from "react";

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
}

export const Modal = ({ open, onClose, children }: ModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-md transform rounded-2xl bg-white p-6 shadow-2xl">
        {children}
      </div>
    </div>
  );
};

export default Modal;
