"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { getStoredRole, type WebRole } from "@/app/service/api/auth-session";
import { useApiResource } from "@/app/service/api/use-api-resource";

const profileRoutes: Record<WebRole, string> = {
  MASTER: "/main/Master/profile",
  PrefeituraVendedor: "/main/Prefeitura?tab=profile",
  COOPERATIVA: "/main/Cooperativa?tab=profile",
};

export function TermsReader() {
  const role = getStoredRole();
  const [refresh, setRefresh] = useState(0);
  const result = useApiResource<{ term: { title: string | null; text: string; version?: number } }>("terms/current", refresh);
  const term = result?.data?.term;

  return (
    <main className="product-workspace min-h-screen px-4 py-8 text-slate-900 dark:text-slate-100 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-3xl space-y-5">
        <Link href={role ? profileRoutes[role] : "/Auth/Login"}
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:underline dark:text-emerald-300">
          <ArrowLeft size={16} aria-hidden="true" /> Voltar ao perfil
        </Link>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900 sm:p-10">
          <h1 className="text-3xl font-semibold tracking-tight">{term?.title || "Termos de uso"}</h1>
          {term?.version !== undefined && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Versão {term.version}</p>}
          {term && <p className="mt-6 whitespace-pre-wrap break-words text-sm leading-7 sm:text-base sm:leading-8">{term.text}</p>}
          {!result && <p role="status" className="mt-5 text-sm text-slate-600 dark:text-slate-300">Carregando termo vigente...</p>}
          {result?.error && (
            <div className="mt-5 space-y-2 text-sm">
              <p role="alert" className="text-rose-700 dark:text-rose-300">{result.error}</p>
              <button type="button" onClick={() => setRefresh((value) => value + 1)}
                className="font-semibold text-emerald-800 underline dark:text-emerald-300">Tentar novamente</button>
            </div>
          )}
        </article>
      </div>
    </main>
  );
}
