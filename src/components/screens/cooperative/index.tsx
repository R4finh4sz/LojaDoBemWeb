"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/app/service/api/authService";
import { apiError, http } from "@/app/service/api/http";
import { CitizenRegistration } from "@/components/screens/admin/citizen-registration";
import { ProfilePage } from "@/components/screens/shared/profile";
import { FormInput } from "@/components/ui/form-input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { inputMasks } from "@/utils/input-masks";
import { isValidCpf } from "@/validation/citizen-registration";

type CreditReceipt = { auditId: string; ecoCoinBalance: string };
const button = "rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60";
const format = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

export default function CooperativeHome() {
  const router = useRouter();
  const [tab, setTab] = useState<"credit" | "resident" | "profile">("credit");
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
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Painel da Cooperativa</h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button className={button} disabled={busy} onClick={async () => {
            await authService.logout();
            router.replace("/Auth/Login");
          }}>Sair</button>
        </div>
      </header>
      <nav aria-label="Cooperativa" className="mt-6 flex flex-wrap gap-3">
        <button className={button} aria-pressed={tab === "credit"} onClick={() => setTab("credit")}>Adicionar ecocoins</button>
        <button className={button} aria-pressed={tab === "resident"} onClick={() => setTab("resident")}>Pré-cadastrar munícipe</button>
        <button className={button} aria-pressed={tab === "profile"} onClick={() => setTab("profile")}>Perfil</button>
      </nav>
      {tab === "credit" && (
        <section className="mt-6 grid gap-6 md:grid-cols-2">
          <form onSubmit={credit} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold">Crédito de ecocoins</h2>
            <FormInput id="credit-cpf" label="CPF do munícipe" value={cpf} onChange={(event) => setCpf(inputMasks.cpf(event.target.value))} placeholder="000.000.000-00" inputMode="numeric" disabled={busy} required />
            <FormInput id="credit-amount" label="Quantidade de ecocoins" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0,00" inputMode="decimal" disabled={busy} required />
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button className={button} disabled={busy}>{busy ? "Registrando..." : "Confirmar crédito"}</button>
          </form>
          {receipt && (
            <section aria-live="polite" className="space-y-3 rounded-3xl border border-emerald-200 bg-white p-6">
              <h2 className="text-xl font-bold">Crédito realizado</h2>
              <dl className="space-y-3 text-sm">
                <div><dt>Protocolo</dt><dd className="break-all font-semibold">{receipt.auditId}</dd></div>
                <div><dt>CPF</dt><dd className="font-semibold">***.***.***-{receipt.cpf.slice(-2)}</dd></div>
                <div><dt>Quantidade creditada</dt><dd className="font-semibold">{format.format(Number(receipt.amount))}</dd></div>
                <div><dt>Novo saldo</dt><dd className="font-semibold">{format.format(Number(receipt.ecoCoinBalance))} ecocoins</dd></div>
              </dl>
            </section>
          )}
        </section>
      )}
      {tab === "resident" && <CitizenRegistration />}
      {tab === "profile" && <ProfilePage roleLabel="Cooperativa" />}
    </main>
  );
}
