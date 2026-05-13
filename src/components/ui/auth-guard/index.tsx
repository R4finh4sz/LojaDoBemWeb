"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AuthGuardProps = {
  children: React.ReactNode;
  redirectTo?: string;
  title?: string;
  message?: string;
};

const defaultMessage = "Você precisa estar logado para acessar esta página.";

export const AuthGuard = ({
  children,
  redirectTo = "/Auth/Login",
  title = "Acesso restrito",
  message = defaultMessage,
}: AuthGuardProps) => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    try {
      const accessToken = window.localStorage.getItem("accessToken");
      const allowed = Boolean(accessToken);
      setHasAccess(allowed);

      if (!allowed) {
        router.replace(redirectTo);
      }
    } finally {
      setIsChecking(false);
    }
  }, [redirectTo, router]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 text-slate-800">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-emerald-600">
            Verificando acesso
          </p>
          <p className="mt-3 text-lg text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 text-slate-800">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-lg ring-1 ring-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">
            {title}
          </p>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Você não pode acessar esta área
          </h1>
          <p className="mt-3 text-base text-slate-600">{message}</p>
          <button
            type="button"
            onClick={() => router.replace(redirectTo)}
            className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Ir para o login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
