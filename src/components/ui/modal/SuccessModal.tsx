"use client";

import React from "react";
import Image from "next/image";
import Modal from "./Modal";
import successIcon from "@/assets/icons/SucessIcon.svg";

interface Props {
  open: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  closeLabel?: string;
  confirmLabel?: string;
  confirmDisabled?: boolean;
  title?: string;
  message?: string;
}

export const SuccessModal = ({
  open,
  onClose,
  onConfirm,
  closeLabel = "Fechar",
  confirmLabel = "Continuar",
  confirmDisabled = false,
  title = "Sucesso!",
  message = "Conta deletada com êxito",
}: Props) => {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <Image src={successIcon} alt="Sucesso" width={40} height={40} />
        </div>


        <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
        <p className="text-sm text-slate-600">{message}</p>

        <div className="mt-4 flex w-full gap-3">
          <button type="button" onClick={onClose} disabled={confirmDisabled}
            className={onConfirm
              ? "flex-1 rounded-lg border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
              : "w-full rounded-lg bg-emerald-700 py-3 text-sm font-semibold text-white hover:bg-emerald-800"}>
            {closeLabel}
          </button>
          {onConfirm && (
            <button type="button" onClick={onConfirm} disabled={confirmDisabled}
              className="flex-1 rounded-lg bg-emerald-700 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SuccessModal;
