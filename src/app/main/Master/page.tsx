"use client";

import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  ClipboardList,
  FileText,
  Users,
} from "lucide-react";

const dashboardCards = [
  {
    title: "Logs em execução",
    description: "Acompanhe eventos, integrações e alertas do sistema.",
    href: "/main/Master/logs",
    icon: BellRing,
  },
  {
    title: "Novo administrador",
    description: "Cadastre um novo admin com os dados completos exigidos.",
    href: "/main/Master/new-admin",
    icon: Users,
  },
  {
    title: "Termos de uso",
    description: "Veja e revise as regras e políticas da plataforma.",
    href: "/main/Master/terms",
    icon: FileText,
  },
  {
    title: "Meu perfil",
    description: "Visualize dados pessoais, logout e exclusão da conta.",
    href: "/main/Master/profile",
    icon: ClipboardList,
  },
];

const liveMetrics = [
  { label: "Eventos monitorados", value: "1.284" },
  { label: "Ações do admin", value: "38" },
  { label: "Alertas ativos", value: "04" },
  { label: "Última sincronização", value: "há 2 min" },
];

export const MasterDashboardPage = () => {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {liveMetrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-3xl border border-emerald-100 bg-white/95 p-5 shadow-[0_12px_32px_rgba(16,185,129,0.06)]"
          >
            <p className="text-sm font-medium text-slate-500">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">
              {metric.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-4xl border border-emerald-100 bg-white/95 p-6 shadow-[0_18px_50px_rgba(16,185,129,0.07)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">
                Visão geral
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                Operação do Master
              </h3>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              Ao vivo
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {dashboardCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5 transition hover:-translate-y-1 hover:border-emerald-200 hover:bg-emerald-100/70"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                      <Icon size={22} />
                    </div>
                    <ArrowRight
                      className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-600"
                      size={18}
                    />
                  </div>
                  <h4 className="mt-5 text-lg font-semibold text-slate-900">
                    {card.title}
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {card.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="rounded-4xl border border-emerald-100 bg-emerald-50 p-6 text-slate-900 shadow-[0_18px_50px_rgba(16,185,129,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Últimos movimentos
          </p>
          <div className="mt-5 space-y-4">
            {[
              "Novo log de sincronização recebido do backend.",
              "Administrador cadastrado com sucesso na fila de aprovação.",
              "Termos de uso atualizados aguardando revisão.",
            ].map((item, index) => (
              <div
                key={item}
                className="rounded-2xl border border-emerald-100 bg-white/75 p-4"
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Evento {index + 1}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default MasterDashboardPage;
