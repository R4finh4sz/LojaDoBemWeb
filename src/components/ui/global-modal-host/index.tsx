"use client";

import ErrorModal from "@/components/ui/modal/ErrorModal";
import { useGlobalModalStore } from "@/stores/useGlobalModalStore";

export const GlobalModalHost = () => {
  const errorOpen = useGlobalModalStore((state) => state.errorOpen);
  const errorMessage = useGlobalModalStore((state) => state.errorMessage);
  const hideError = useGlobalModalStore((state) => state.hideError);

  return (
    <ErrorModal open={errorOpen} message={errorMessage} onClose={hideError} />
  );
};

export default GlobalModalHost;
