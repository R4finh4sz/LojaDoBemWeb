"use client";

const logs = [
  {
    time: "16:21:12",
    source: "auth-service",
    level: "INFO",
    message: "JWT validado para o usuário MasterTeste.",
  },
  {
    time: "16:20:55",
    source: "admin-registry",
    level: "WARN",
    message: "Cadastro de administrador aguardando confirmação de backend.",
  },
  {
    time: "16:20:03",
    source: "audit-trail",
    level: "INFO",
    message: "Termos de uso visualizados pelo Master.",
  },
  {
    time: "16:19:41",
    source: "profile-service",
    level: "INFO",
    message: "Perfil do master aberto com sucesso.",
  },
  {
    time: "16:18:08",
    source: "sync-worker",
    level: "ERROR",
    message: "Falha temporária na captura de eventos externos.",
  },
];

export const MasterLogsPage = () => {
  return (
    <section className="space-y-6">
      <div className="rounded-4xl border border-emerald-100 bg-white/95 p-6 shadow-[0_18px_50px_rgba(16,185,129,0.07)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">
          Logs ao vivo
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-slate-900">
          Monitoramento em tempo real
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Esta tela já está preparada para receber dados do backend. Enquanto a
          integração não está ligada, os eventos abaixo simulam o painel de
          observabilidade do Master.
        </p>
      </div>

      <div className="grid gap-4">
        {logs.map((log) => (
          <article
            key={`${log.time}-${log.source}`}
            className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-5 shadow-[0_12px_32px_rgba(16,185,129,0.05)]"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    log.level === "ERROR"
                      ? "bg-red-50 text-red-700"
                      : log.level === "WARN"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {log.level}
                </span>
                <p className="font-mono text-sm text-slate-500">{log.time}</p>
              </div>
              <p className="text-sm font-medium text-slate-500">{log.source}</p>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              {log.message}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default MasterLogsPage;
