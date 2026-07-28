"use client";

import React from "react";
import Image from "next/image";
import Modal from "./Modal";
import errorIcon from "@/assets/icons/ErrorIcon.svg";

interface Props {
  open: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  message?: string;
  closeLabel?: string;
  confirmLabel?: string;
  title?: string;
}

export const ErrorModal = ({
  open,
  onClose,
  onConfirm,
  message,
  closeLabel = "Fechar",
  confirmLabel = "Sim",
  title = "Erro!",
}: Props) => {
  const displayMessage = message ?? "Ocorreu um erro. Tente novamente.";
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
          <Image src={errorIcon} alt="Erro" width={40} height={40} />
        </div>

        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-600">{displayMessage}</p>

        {onConfirm ? (
          <div className="mt-4 flex w-full gap-4">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-rose-400 py-3 text-sm font-semibold text-rose-600"
            >
              {closeLabel}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 rounded-lg bg-rose-600 py-3 text-sm font-semibold text-white hover:bg-rose-700"
            >
              {confirmLabel}
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="mt-4 w-full rounded-lg bg-rose-600 py-3 text-sm font-semibold text-white hover:bg-rose-700"
          >
            {closeLabel}
          </button>
        )}
      </div>
    </Modal>
  );
};

export default ErrorModal;
