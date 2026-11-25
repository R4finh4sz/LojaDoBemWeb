"use client";

import { useRouter } from "next/navigation";
import ErrorModal from "@/components/ui/modal/ErrorModal";
import SuccessModal from "@/components/ui/modal/SuccessModal";
import { useGlobalModalStore } from "@/stores/useGlobalModalStore";

export const GlobalModalHost = () => {
  const router = useRouter();
  const errorOpen = useGlobalModalStore((state) => state.errorOpen);
  const errorMessage = useGlobalModalStore((state) => state.errorMessage);
  const hideError = useGlobalModalStore((state) => state.hideError);
  const successOpen = useGlobalModalStore((state) => state.successOpen);
  const successMessage = useGlobalModalStore((state) => state.successMessage);
  const hideSuccess = useGlobalModalStore((state) => state.hideSuccess);
  const goBackOnSuccessClose = useGlobalModalStore((state) => state.goBackOnSuccessClose);
  const closeSuccess = () => {
    hideSuccess();
    if (goBackOnSuccessClose) router.back();
  };

  return (
    <>
      <ErrorModal open={errorOpen} message={errorMessage} onClose={hideError} />
      <SuccessModal open={successOpen} message={successMessage} onClose={closeSuccess} />
    </>
  );
};

export default GlobalModalHost;
