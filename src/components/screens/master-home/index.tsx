"use client";

import Image from "next/image";
import logo from "@/assets/Images/LogoImage.png";
import AuthGuard from "@/components/ui/auth-guard";

export const MasterHome = () => {
  return (
    <AuthGuard title="Painel do Master">
      <div className="min-h-screen bg-gray-50 p-8 text-slate-800">
        <header className="mb-8 flex items-center gap-4">
          <div className="h-12 w-12 overflow-hidden rounded-xl bg-white shadow">
            <Image src={logo} alt="logo" width={48} height={48} />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Painel do Master
          </h1>
        </header>

        <main>
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-xl bg-white p-6 text-slate-800 shadow">
              Visão geral do sistema
            </div>
            <div className="rounded-xl bg-white p-6 text-slate-800 shadow">
              Gerenciar administradores
            </div>
            <div className="rounded-xl bg-white p-6 text-slate-800 shadow">
              Auditoria
            </div>
            <div className="rounded-xl bg-white p-6 text-slate-800 shadow">
              Configurações globais
            </div>
          </section>
        </main>
      </div>
    </AuthGuard>
  );
};

export default MasterHome;
