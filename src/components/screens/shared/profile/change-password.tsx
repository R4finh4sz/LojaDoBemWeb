"use client";

import { CheckCircle2, KeyRound, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { demoCode, demoEnabled } from "@/app/service/api/demo-config";
import { apiError, http } from "@/app/service/api/http";
import { FormInput } from "@/components/ui/form-input";
import { forgotPasswordResetSchema } from "@/validation/forgot-password";

type Step =
  | { kind: "request" }
  | { kind: "verify"; challengeId: string }
  | { kind: "password"; resetToken: string }
  | { kind: "complete" };

const primary = "inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50";
const secondary = "rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 dark:hover:bg-slate-800";

export function ChangePassword({ email, managed }: { email: string; managed: boolean }) {
  const [step, setStep] = useState<Step>({ kind: "request" });
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(operation: () => Promise<void>, fallback: string) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await operation();
    } catch (error) {
      setError(apiError(error, fallback));
    } finally {
      setBusy(false);
    }
  }

  function requestCode() {
    void run(async () => {
      const { data } = await http.post<{ challengeId: string }>("account/password/code");
      setCode("");
      setStep({ kind: "verify", challengeId: data.challengeId });
    }, "Não foi possível enviar o código.");
  }

  function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step.kind !== "verify" || code.length !== 6) return;
    void run(async () => {
      const { data } = await http.post<{ resetToken: string }>("account/password/verify-code", { challengeId: step.challengeId, code });
      setCode("");
      setStep({ kind: "password", resetToken: data.resetToken });
    }, "Não foi possível verificar o código.");
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step.kind !== "password") return;
    const values = new FormData(event.currentTarget);
    const parsed = forgotPasswordResetSchema.safeParse({
      password: values.get("password"),
      confirmPassword: values.get("confirmPassword"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    if (new TextEncoder().encode(parsed.data.password).length > 72) {
      setError("A senha pode ter no máximo 72 bytes.");
      return;
    }
    void run(async () => {
      await http.post("account/password/change", {
        resetToken: step.resetToken,
        password: parsed.data.password,
        passwordConfirmation: parsed.data.confirmPassword,
      });
      setStep({ kind: "complete" });
    }, "Não foi possível salvar a nova senha.");
  }

  return (
    <section aria-labelledby="profile-password" className="max-w-xl space-y-5">
      <h4 id="profile-password" className="text-2xl font-bold">Alterar senha</h4>
      {managed ? (
        <p className="text-sm leading-relaxed text-slate-600">A senha da conta Master é gerenciada na configuração do servidor.</p>
      ) : (
        <>
          {step.kind === "request" && (
            <>
              <p className="text-sm leading-relaxed text-slate-600">
                Envie um código para {email ? <strong>{email}</strong> : "o e-mail da sua conta"} para confirmar a alteração.
              </p>
              <button type="button" className={primary} onClick={requestCode} disabled={busy}>
                <Mail size={17} aria-hidden="true" />{busy ? "Enviando..." : "Enviar código"}
              </button>
            </>
          )}
          {step.kind === "verify" && (
            <form onSubmit={verify} className="space-y-4">
              <p className="text-sm text-slate-600">
                {demoEnabled ? <>Use o código de demonstração <strong>{demoCode}</strong>.</> :
                  <>Digite o código de seis dígitos enviado para {email || "seu e-mail"}.</>}
              </p>
              <FormInput id="profile-password-code" label="Código de verificação" inputMode="numeric" autoComplete="one-time-code"
                maxLength={6} value={code} disabled={busy} onChange={(event) => setCode(event.target.value.replace(/[^0-9]/g, "").slice(0, 6))} />
              <div className="flex flex-wrap gap-3">
                <button type="submit" className={primary} disabled={busy || code.length !== 6}>Verificar código</button>
                <button type="button" className={secondary} onClick={requestCode} disabled={busy}>Reenviar código</button>
              </div>
            </form>
          )}
          {step.kind === "password" && (
            <form onSubmit={save} className="space-y-4">
              <FormInput id="profile-new-password" label="Nova senha" name="password" type="password" autoComplete="new-password"
                helpText="Use pelo menos 8 caracteres, com letras maiúsculas, minúsculas e números." required disabled={busy} />
              <FormInput id="profile-confirm-password" label="Confirmar nova senha" name="confirmPassword" type="password" autoComplete="new-password" required disabled={busy} />
              <div className="flex flex-wrap gap-3">
                <button type="submit" className={primary} disabled={busy}>
                  <KeyRound size={17} aria-hidden="true" />{busy ? "Salvando..." : "Salvar nova senha"}
                </button>
              </div>
            </form>
          )}
          {step.kind === "complete" && (
            <div role="status" className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/75 p-4 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/45 dark:text-emerald-100">
              <CheckCircle2 size={22} aria-hidden="true" className="shrink-0" />
              <p className="text-sm"><strong>Senha alterada com sucesso.</strong> Você continua conectado nesta sessão.</p>
            </div>
          )}
          {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
        </>
      )}
    </section>
  );
}
