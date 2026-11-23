"use client";

import { useApiResource } from "@/app/service/api/use-api-resource";

export type MasterDashboard = {
  lastRegistration: { name: string; role: string; createdAt: string } | null;
  pointsDistributed: { total: string; currentMonth: string; changePercent: number | null };
  threats: { blocked: number };
  rateLimit: { sanctions: number; activeClients: number };
  recentActivity: { id: string; kind: string; name?: string; role?: string; createdAt: string }[];
  systemHealth: Record<"api" | "authentication" | "processing", { status: "UP" | "DEGRADED" | "UNKNOWN" }>;
};

const surface = "rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900";
const time = (date: string) => new Date(date).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
const number = (value: string | number) => Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
const roleName = (role?: string) => role === "COOPERATIVA" ? "Cooperativa" : "Vendedor da Prefeitura";
const healthLabels = { UP: "Disponível", DEGRADED: "Instável", UNKNOWN: "Aguardando verificação" };
const activities: Record<string, string> = { OPERATOR_REGISTERED: "Cadastro de operador", TWO_FACTOR_BLOCK: "Bloqueio de 2FA", RATE_LIMIT_BLOCK: "Limite de requisições" };

export function MasterActivity({ activity }: { activity: MasterDashboard["recentActivity"] }) {
  return (
    <section className={surface}>
      <h3 className="text-xl font-bold">Atividade recente</h3>
      {!activity.length && <p className="mt-3">Nenhum evento registrado.</p>}
      <ul className="mt-3 divide-y divide-slate-200">
        {activity.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
            <div><strong>{activities[item.kind] ?? item.kind}</strong>{item.name && <p>{item.name} · {roleName(item.role)}</p>}</div>
            <time dateTime={item.createdAt}>{time(item.createdAt)}</time>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function MasterDashboardPage() {
  const result = useApiResource<MasterDashboard>("master/dashboard");
  if (!result?.data) return <p role={result?.error ? "alert" : "status"}>{result?.error ?? "Carregando painel..."}</p>;
  const data = result.data;
  const metrics = [
    { label: "Último cadastro", value: data.lastRegistration?.name ?? "Sem cadastros", detail: data.lastRegistration && time(data.lastRegistration.createdAt) },
    { label: "Ecocoins distribuídos", value: number(data.pointsDistributed.total), detail: number(data.pointsDistributed.currentMonth) + " neste mês" },
    { label: "Bloqueios de 2FA", value: number(data.threats.blocked), detail: "Neste mês" },
    { label: "Bloqueios por limite de requisições", value: number(data.rateLimit.sanctions), detail: number(data.rateLimit.activeClients) + " ativos" },
  ];
  const services = [
    { label: "API", status: data.systemHealth.api.status },
    { label: "Autenticação", status: data.systemHealth.authentication.status },
    { label: "Processamento", status: data.systemHealth.processing.status },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, detail }) => (
          <article key={label} className={surface}>
            <h3 className="text-sm font-semibold">{label}</h3>
            <p className="mt-3 text-2xl font-bold">{value}</p>
            {detail && <p className="mt-2 text-sm">{detail}</p>}
          </article>
        ))}
      </section>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <MasterActivity activity={data.recentActivity} />
        <section className={surface}>
          <h3 className="text-xl font-bold">Saúde do sistema</h3>
          <dl className="mt-3 divide-y divide-slate-200">
            {services.map(({ label, status }) => <div key={label} className="flex justify-between gap-4 py-3 text-sm"><dt>{label}</dt><dd>{healthLabels[status]}</dd></div>)}
          </dl>
        </section>
      </div>
    </div>
  );
}
