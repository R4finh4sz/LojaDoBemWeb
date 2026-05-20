"use client";

const termsSections = [
  {
    title: "Uso da plataforma",
    text: "O Master tem acesso a ferramentas administrativas, auditoria e revisão de conteúdo. Todo uso deve respeitar a política interna e os papéis definidos.",
  },
  {
    title: "Dados pessoais",
    text: "As informações exibidas no perfil e no cadastro de administradores devem ser tratadas como dados sensíveis e mantidas sob controle da equipe autorizada.",
  },
  {
    title: "Auditoria",
    text: "A atividade do Master, alterações de perfil, novos cadastros e operações críticas podem ser registradas para fins de segurança e conformidade.",
  },
];

export const MasterTermsPage = () => {
  return (
    <section className="space-y-6">
      <div className="rounded-4xl border border-emerald-100 bg-white/95 p-6 shadow-[0_18px_50px_rgba(16,185,129,0.07)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">
          Termos de uso
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-slate-900">
          Regras da área Master
        </h3>
      </div>

      <div className="grid gap-4">
        {termsSections.map((section) => (
          <article
            key={section.title}
            className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-6 shadow-[0_12px_32px_rgba(16,185,129,0.05)]"
          >
            <h4 className="text-lg font-semibold text-slate-900">
              {section.title}
            </h4>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {section.text}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default MasterTermsPage;
