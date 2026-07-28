"use client";

import React from "react";
import Image from "next/image";
import Modal from "./Modal";
import successIcon from "@/assets/icons/SucessIcon.svg";

interface Props {
  open: boolean;
  onClose?: () => void;
  title?: string;
  message?: string;
}

export const SuccessModal = ({
  open,
  onClose,
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

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-emerald-700 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          Fechar
        </button>
      </div>
    </Modal>
  );
};

export default SuccessModal;
