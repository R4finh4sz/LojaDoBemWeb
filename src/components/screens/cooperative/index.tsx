"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Coins, House, LogOut, Menu, Recycle, UserRound, X } from "lucide-react";
import { authService } from "@/app/service/api/authService";
import { demoCpf, demoEnabled } from "@/app/service/api/demo-config";
import { apiError, http } from "@/app/service/api/http";
import { ProfilePage } from "@/components/screens/shared/profile";
import { FormInput } from "@/components/ui/form-input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { inputMasks } from "@/utils/input-masks";
import { isValidCpf } from "@/validation/citizen-registration";

type CreditReceipt = { auditId: string; ecoCoinBalance: string };
const button = "rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60";
const format = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
const sections = [
  { id: "home", label: "Início", icon: House },
  { id: "credit", label: "Adicionar ecocoins", icon: Coins },
  { id: "profile", label: "Perfil", icon: UserRound },
] as const;

export default function CooperativeHome() {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof sections)[number]["id"]>("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [cpf, setCpf] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<(CreditReceipt & { cpf: string; amount: string }) | null>(null);
  const attempt = useRef<{ cpf: string; amount: string; key: string } | null>(null);
  const inFlight = useRef(false);

  async function credit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    const residentCpf = cpf.replace(/[^0-9]/g, "");
    const value = amount.trim().replace(",", ".");
    if (!isValidCpf(residentCpf) || !/^[0-9]{1,10}([.][0-9]{1,2})?$/.test(value) || Number(value) <= 0) {
      setError("Informe um CPF válido e um valor positivo com até duas casas decimais.");
      return;
    }
    const normalizedAmount = Number(value).toFixed(2);
    if (attempt.current?.cpf !== residentCpf || attempt.current.amount !== normalizedAmount) {
      attempt.current = { cpf: residentCpf, amount: normalizedAmount, key: crypto.randomUUID() };
    }
    inFlight.current = true;
    setBusy(true);
    setError("");
    setReceipt(null);
    try {
      const { data } = await http.post<CreditReceipt>(
        "residents/credits",
        { cpf: residentCpf, amount: normalizedAmount },
        { headers: { "Idempotency-Key": attempt.current.key } },
      );
      setReceipt({ ...data, cpf, amount: normalizedAmount });
      setCpf("");
      setAmount("");
      attempt.current = null;
    } catch (error) {
      setError(apiError(error, "Não foi possível confirmar o crédito. Tente novamente com os mesmos dados."));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-200 lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="flex flex-col border-b border-slate-200 bg-white px-4 py-4 lg:sticky lg:top-0 lg:h-dvh lg:border-r lg:border-b-0 lg:px-5 lg:py-6">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-700 text-white">
            <Recycle size={22} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-bold">ReciclaOnline</p>
            <p className="text-sm text-slate-600">Cooperativa</p>
          </div>
          <button type="button" aria-expanded={menuOpen} aria-controls="cooperative-menu" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            className="grid size-10 place-items-center rounded-xl border border-slate-200 lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <div id="cooperative-menu" className={`mt-5 flex-1 flex-col gap-4 lg:mt-8 lg:flex ${menuOpen ? "flex" : "hidden"}`}>
          <nav aria-label="Cooperativa" className="grid gap-1">
            {sections.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" aria-current={tab === id ? "page" : undefined}
                onClick={() => { setTab(id); setMenuOpen(false); }}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${tab === id
                  ? "bg-emerald-700 text-white"
                  : "text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                <Icon size={18} className="shrink-0" aria-hidden="true" />{label}
              </button>
            ))}
          </nav>
          <button type="button" className="mt-auto flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:hover:bg-slate-800" disabled={busy} onClick={async () => {
            await authService.logout();
            router.replace("/Auth/Login");
          }}>
            <LogOut size={18} aria-hidden="true" />Sair
          </button>
        </div>
      </aside>
      <main className="mx-auto w-full max-w-7xl min-w-0 px-4 py-6 sm:px-8 lg:py-9">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Painel da Cooperativa</h1>
          <ThemeToggle />
        </header>
        {tab === "home" && (
          <section aria-labelledby="service-heading" className="space-y-6">
            <div>
              <h2 id="service-heading" className="text-xl font-bold">Atendimento ao munícipe</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <article className="flex flex-col items-start rounded-3xl border border-slate-200 bg-white p-6">
                <span className="mb-4 grid size-11 place-items-center rounded-xl bg-emerald-700 text-white">
                  <Coins size={21} aria-hidden="true" />
                </span>
                <p className="mb-5 text-sm leading-relaxed text-slate-600">Informe o CPF do munícipe e a quantidade de ecocoins. Após confirmar, confira o protocolo e o saldo atualizado.</p>
                <button type="button" onClick={() => setTab("credit")} className={button + " mt-auto inline-flex items-center gap-2"}>
                  Adicionar ecocoins<ArrowRight size={16} aria-hidden="true" />
                </button>
              </article>
              <aside className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold">CPF não encontrado?</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Confira os dígitos com o munícipe. Se ele ainda não tiver cadastro, oriente-o a procurar o atendimento da Prefeitura.
                </p>
                <div className="mt-auto pt-4">
                  <p className="border-t border-slate-200 pt-3 text-sm text-slate-600">Em caso de dúvidas, entre em contato com a equipe da Prefeitura.</p>
                  <p className="mt-1 text-sm font-semibold">Fundo Social · 4696-000</p>
                </div>
              </aside>
            </div>
          </section>
        )}
        {tab === "credit" && (
          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <form onSubmit={credit} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-bold">Crédito de ecocoins</h2>
              {demoEnabled && <p className="text-sm">CPF de teste <strong>{demoCpf}</strong></p>}
              <FormInput id="credit-cpf" label="CPF do munícipe" value={cpf} onChange={(event) => setCpf(inputMasks.cpf(event.target.value))} placeholder="000.000.000-00" inputMode="numeric" disabled={busy} required />
              <FormInput id="credit-amount" label="Quantidade de ecocoins" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0,00" inputMode="decimal" disabled={busy} required />
              {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
              <button className={button} disabled={busy}>{busy ? "Registrando..." : "Confirmar crédito"}</button>
            </form>
            {receipt && (
              <section aria-live="polite" className="space-y-3 rounded-3xl border border-emerald-200 bg-white p-6">
                <h2 className="text-xl font-bold">Crédito realizado</h2>
                <dl className="space-y-3 text-sm">
                  <div><dt>Protocolo</dt><dd className="break-all font-semibold">{receipt.auditId}</dd></div>
                  <div><dt>CPF</dt><dd className="font-semibold">***.***.***-{receipt.cpf.slice(-2)}</dd></div>
                  <div><dt>Quantidade creditada</dt><dd className="font-semibold">{format.format(Number(receipt.amount))} {Number(receipt.amount) === 1 ? "moeda" : "moedas"}</dd></div>
                  <div><dt>Novo saldo</dt><dd className="font-semibold">{format.format(Number(receipt.ecoCoinBalance))} ecocoins</dd></div>
                </dl>
              </section>
            )}
          </section>
        )}
        {tab === "profile" && <ProfilePage roleLabel="Cooperativa" />}
      </main>
    </div>
  );
}
