"use client";

import ErrorModal from "@/components/ui/modal/ErrorModal";
import SuccessModal from "@/components/ui/modal/SuccessModal";
import { useGlobalModalStore } from "@/stores/useGlobalModalStore";

export const GlobalModalHost = () => {
  const errorOpen = useGlobalModalStore((state) => state.errorOpen);
  const errorMessage = useGlobalModalStore((state) => state.errorMessage);
  const hideError = useGlobalModalStore((state) => state.hideError);
  const successOpen = useGlobalModalStore((state) => state.successOpen);
  const successMessage = useGlobalModalStore((state) => state.successMessage);
  const hideSuccess = useGlobalModalStore((state) => state.hideSuccess);

  return (
    <>
      <ErrorModal open={errorOpen} message={errorMessage} onClose={hideError} />
      <SuccessModal open={successOpen} message={successMessage} onClose={hideSuccess} />
    </>
  );
};

export default GlobalModalHost;
