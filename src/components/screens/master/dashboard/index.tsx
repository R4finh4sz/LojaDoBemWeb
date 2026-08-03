"use client";

import { AlertTriangle, BadgeCheck, Coins, ShieldAlert, UserPlus } from "lucide-react";

const metrics = [
  { label: "Último cadastro", value: "Hoje, 10:42", detail: "Cooperativa Verde Sul", icon: UserPlus, tone: "emerald" },
  { label: "Pontos distribuídos", value: "1.284.650", detail: "+8,4% neste mês", icon: Coins, tone: "blue" },
  { label: "Ameaças detectadas", value: "2", detail: "Bloqueadas automaticamente", icon: ShieldAlert, tone: "red" },
  { label: "Sanções por rate limit", value: "7", detail: "3 usuários ainda restritos", icon: AlertTriangle, tone: "amber" },
] as const;

const activities = [
  { title: "Novo administrador cadastrado", detail: "Carolina Mendes · há 12 min", status: "Concluído" },
  { title: "Tentativa incomum de acesso", detail: "IP bloqueado pelo monitoramento · há 38 min", status: "Bloqueado" },
  { title: "Limite de requisições excedido", detail: "3 contas receberam restrição temporária · há 1 h", status: "Atenção" },
];

const toneClass = {
  emerald: "bg-emerald-100 text-emerald-700",
  blue: "bg-blue-100 text-blue-700",
  red: "bg-red-100 text-red-700",
  amber: "bg-amber-100 text-amber-700",
};

const statusClass: Record<string, string> = {
  Concluído: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  Bloqueado: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  Atenção: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
};

export default function MasterDashboardPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Resumo da plataforma</p>
        <h3 className="mt-2 text-3xl font-bold text-slate-900">Tudo sob controle</h3>
        <p className="mt-2 text-slate-600">Indicadores gerais, segurança e atividade recente do ecossistema.</p>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, detail, icon: Icon, tone }) => (
          <article key={label} className="min-h-56 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_38px_rgba(15,23,42,0.13)]">
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClass[tone]}`}><Icon size={21} /></div>
            <p className="mt-5 text-sm font-medium text-slate-600">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
            <p className="mt-2 text-xs font-medium text-slate-500">{detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.14)]">
          <h4 className="text-xl font-bold text-slate-900">Atividade recente</h4>
          <div className="mt-5 divide-y divide-slate-200">
            {activities.map((activity) => (
              <div key={activity.title} className="flex flex-col gap-2 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="font-semibold text-slate-800">{activity.title}</p><p className="mt-1 text-sm text-slate-500">{activity.detail}</p></div>
                <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusClass[activity.status]}`}>{activity.status}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-[0_18px_48px_rgba(15,23,42,0.14)]">
          <BadgeCheck className="text-emerald-600" size={30} />
          <h4 className="mt-5 text-xl font-bold">Saúde do sistema</h4>
          <p className="mt-2 text-sm leading-6 text-slate-600">Todos os serviços essenciais estão disponíveis.</p>
          <div className="mt-6 space-y-3 text-sm">
            {[["API principal", "99,98%"], ["Autenticação", "100%"], ["Processamento", "99,91%"]].map(([name, value]) => (
              <div key={name} className="flex justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"><span>{name}</span><strong className="text-emerald-700">{value}</strong></div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
