"use client";

import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import logo from "@/assets/Images/LogoImage.png";
import { apiError, http } from "@/app/service/api/http";
import { getRoleHomePath, getTokenRole, isJwtValid, storeAuthSession } from "@/app/service/api/auth-session";
import { AuthHeader } from "@/components/ui/auth-header";
import { FormInput } from "@/components/ui/form-input";
import { useGlobalModalStore } from "@/stores/useGlobalModalStore";
import { forgotPasswordResetSchema } from "@/validation/forgot-password";

type FirstLoginGrant = { token: string; email: string; remember: boolean };
type Term = { documentId: string; title: string | null; text: string; version: number };
type State = { grant: FirstLoginGrant; term?: Term; error?: string };

export function FirstLoginPage() {
  const router = useRouter();
  const showError = useGlobalModalStore((state) => state.showError);
  const showSuccess = useGlobalModalStore((state) => state.showSuccess);
  const [state, setState] = useState<State>();
  const [retry, setRetry] = useState(0);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const passwordLength = new TextEncoder().encode(password).length;
  const valid = forgotPasswordResetSchema.safeParse({ password, confirmPassword }).success && passwordLength <= 72;

  useEffect(() => {
    let grant: FirstLoginGrant;
    try {
      grant = JSON.parse(sessionStorage.getItem("firstLoginToken") ?? "null");
      if (!grant?.token || !grant.email) throw new Error();
    } catch {
      sessionStorage.removeItem("firstLoginToken");
      router.replace("/Auth/Login");
      return;
    }
    const controller = new AbortController();
    http.get<Term>("auth/first-login/terms", {
      headers: { Authorization: "Bearer " + grant.token },
      signal: controller.signal,
    }).then(({ data }) => {
      if (!controller.signal.aborted) setState({ grant, term: data });
    }).catch((error) => {
      if (!controller.signal.aborted) setState({ grant, error: apiError(error, "Não foi possível carregar os termos de uso.") });
    });
    return () => controller.abort();
  }, [retry, router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!state?.term || !valid || !accepted || busy) return;
    const { grant, term } = state;
    setBusy(true);
    try {
      const { data } = await http.post<{ token: string }>("auth/first-login", {
        password, passwordConfirmation: confirmPassword, termsAccepted: true, termDocumentId: term.documentId,
      }, { headers: { Authorization: "Bearer " + grant.token } });
      sessionStorage.removeItem("firstLoginToken");
      const token = data?.token;
      const role = token && isJwtValid(token) ? getTokenRole(token) : null;
      if (token && role) storeAuthSession(token, grant.email, grant.remember);
      router.replace(getRoleHomePath(role));
      showSuccess(role ? "Primeiro acesso concluído." : "Primeiro acesso concluído. Entre com a nova senha.");
    } catch (error) {
      showError(apiError(error, "Não foi possível concluir o primeiro acesso."));
      if (isAxiosError(error) && error.response?.status === 409) {
        setAccepted(false);
        setState(undefined);
        setRetry((value) => value + 1);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7fbf8] dark:bg-[#07100b]">
      <AuthHeader logo={logo} backHref="/Auth/Login" backLabel="Voltar ao login" />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <section className="space-y-5 rounded-3xl border border-emerald-100 bg-white p-6 dark:border-slate-700 dark:bg-slate-900 sm:p-8">
          <h1 className="text-2xl font-semibold">Primeiro acesso</h1>
          {!state && <p role="status" className="text-sm text-slate-600">Carregando termos de uso...</p>}
          {state?.error && (
            <div className="space-y-3 text-sm">
              <p role="alert" className="text-rose-700 dark:text-rose-300">{state.error}</p>
              <button type="button" className="font-medium text-emerald-700 underline" onClick={() => {
                setState(undefined);
                setRetry((value) => value + 1);
              }}>Tentar novamente</button>
            </div>
          )}
          {state?.term && (
            <form onSubmit={submit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput label="Nova senha" type="password" autoComplete="new-password" required disabled={busy}
                  value={password} onChange={(event) => setPassword(event.target.value)}
                  helpText="Use pelo menos 8 caracteres e no máximo 72 bytes." />
                <FormInput label="Confirmar nova senha" type="password" autoComplete="new-password" required disabled={busy}
                  value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
              </div>
              {confirmPassword && password !== confirmPassword && <p className="text-sm text-rose-700 dark:text-rose-300">As senhas não coincidem.</p>}
              <div className="max-h-64 space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                <h2 className="font-semibold">{state.term.title || "Termos de uso"}</h2>
                <p className="whitespace-pre-wrap break-words text-sm leading-6">{state.term.text}</p>
              </div>
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" checked={accepted} required disabled={busy} onChange={(event) => setAccepted(event.target.checked)}
                  className="mt-0.5 size-4 accent-emerald-700" />
                <span>Li e aceito os termos de uso.</span>
              </label>
              <button type="submit" disabled={busy || !valid || !accepted}
                className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50 sm:w-auto">
                {busy ? "Salvando..." : "Concluir primeiro acesso"}
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
