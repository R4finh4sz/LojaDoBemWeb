"use client";

import { useEffect, useState } from "react";
import { apiError, http } from "./http";

export function useApiResource<T>(url: string | null, refresh = 0) {
  const [result, setResult] = useState<{ url: string; refresh: number; data?: T; error?: string }>();
  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    http.get<T>(url, { signal: controller.signal }).then(({ data }) => {
      if (!controller.signal.aborted) setResult({ url, refresh, data });
    }).catch((error) => {
      if (!controller.signal.aborted) setResult({ url, refresh, error: apiError(error, "Não foi possível carregar os dados.") });
    });
    return () => controller.abort();
  }, [url, refresh]);
  return result?.url === url && result.refresh === refresh ? result : undefined;
}
