"use client";

import { useRouter } from "next/navigation";
import { LogOut, Trash2, UserCircle2 } from "lucide-react";
import {
  clearAuthSession,
  getStoredUserEmail,
  getStoredUserName,
} from "@/app/service/api/auth-session";

export const MasterProfilePage = () => {
  const router = useRouter();
  const userName = getStoredUserName() ?? "Master";
  const userEmail = getStoredUserEmail() ?? "master@reciclaonline.com";

  const personalData = [
    { label: "Nome", value: userName },
    { label: "E-mail", value: userEmail },
    { label: "Documento", value: "***.***.***-**" },
    { label: "Telefone", value: "+55 (11) 99999-9999" },
    { label: "Função", value: "Master" },
  ];

  const handleLogout = () => {
    clearAuthSession();
    router.replace("/Auth/Login");
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir a conta? Esta ação remove a sessão local e prepara o espaço para integração com o backend.",
    );

    if (!confirmed) {
      return;
    }

    clearAuthSession();
    router.replace("/Auth/Login");
  };

  return (
    <section className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
      <div className="rounded-4xl border border-emerald-100 bg-white/95 p-6 shadow-[0_18px_50px_rgba(16,185,129,0.07)]">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-600/25">
            <UserCircle2 size={34} />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">
              Perfil
            </p>
            <h3 className="text-2xl font-semibold text-slate-900">
              {userName}
            </h3>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {personalData.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3"
            >
              <span className="text-sm font-medium text-slate-500">
                {item.label}
              </span>
              <span className="text-sm font-semibold text-slate-900">
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            <LogOut size={16} />
            Logout
          </button>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            <Trash2 size={16} />
            Excluir conta
          </button>
        </div>
      </div>

      <div className="rounded-4xl border border-emerald-100 bg-white/95 p-6 shadow-[0_18px_50px_rgba(16,185,129,0.07)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">
          Dados pessoais
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-slate-900">
          Informações do Master
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Esta área mostra os principais dados do perfil e já está pronta para
          receber integração com o backend quando você quiser persistir edição,
          senha ou exclusão definitiva.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            "Histórico de acessos",
            "Alteração de senha",
            "Foto do perfil",
            "Preferências da conta",
          ].map((item) => (
            <div
              key={item}
              className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5 text-sm font-medium text-slate-700"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MasterProfilePage;
