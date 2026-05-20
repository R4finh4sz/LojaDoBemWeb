"use client";

import React from "react";
import Image from "next/image";
import logo from "@/assets/Images/LogoImage.png";
import AuthGuard from "@/components/ui/auth-guard";

export const AdminHome = () => {
  return (
    <AuthGuard title="Painel do Administrador" allowedRoles={5}>
      <div className="min-h-screen bg-gray-50 p-8 text-slate-800">
        <header className="mb-8 flex items-center gap-4">
          <div className="h-12 w-12 overflow-hidden rounded-xl bg-white shadow">
            <Image src={logo} alt="logo" width={48} height={48} />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Painel do Administrador
          </h1>
        </header>

        <main>
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-xl bg-white p-6 text-slate-800 shadow">
              Resumo de usuários
            </div>
            <div className="rounded-xl bg-white p-6 text-slate-800 shadow">
              Gerenciar recompensas
            </div>
            <div className="rounded-xl bg-white p-6 text-slate-800 shadow">
              Relatórios
            </div>
            <div className="rounded-xl bg-white p-6 text-slate-800 shadow">
              Configurações
            </div>
          </section>
        </main>
      </div>
    </AuthGuard>
  );
};

export default AdminHome;
