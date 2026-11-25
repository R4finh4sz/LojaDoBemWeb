"use client";

import { ArrowRight, ShieldCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { clearAuthSession } from "@/app/service/api/auth-session";
import { apiError, http } from "@/app/service/api/http";
import { FormInput } from "@/components/ui/form-input";
import Modal from "@/components/ui/modal/Modal";
import { useGlobalModalStore } from "@/stores/useGlobalModalStore";

type Props =
  | { mode: "two-factor"; enabled: boolean; onChanged: (enabled: boolean) => void }
  | { mode: "delete" };

export const accountRow = "flex min-h-14 w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium dark:border-slate-700 dark:bg-slate-900";

export function AccountSecurity(props: Props) {
  const router = useRouter();
  const showSuccess = useGlobalModalStore((state) => state.showSuccess);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const pending = useRef(false);
  const deleting = props.mode === "delete";
  const action = deleting ? "Excluir conta" : props.enabled ? "Desativar verificação" : "Ativar verificação";
  const Icon = deleting ? Trash2 : ShieldCheck;

  function openConfirmation() {
    setError("");
    setPassword("");
    setOpen(true);
  }

  function closeConfirmation() {
    if (pending.current) return;
    setOpen(false);
    setPassword("");
  }

  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const password = new FormData(event.currentTarget).get("password");
    if (typeof password !== "string" || !password) return;

    pending.current = true;
    setBusy(true);
    setError("");
    try {
      if (props.mode === "delete") {
        await http.delete("account", { data: { password } });
        clearAuthSession();
        setOpen(false);
        router.replace("/Auth/Login");
        showSuccess("Conta excluída com sucesso.");
        return;
      }

      const { data } = await http.patch<{ twoFactorEnabled: boolean }>("account/two-factor", {
        enabled: !props.enabled,
        password,
      });
      props.onChanged(data.twoFactorEnabled);
      setOpen(false);
      setPassword("");
      showSuccess(data.twoFactorEnabled ? "Verificação em duas etapas ativada." : "Verificação em duas etapas desativada.");
    } catch (error) {
      setError(apiError(error, deleting ? "Não foi possível excluir a conta." : "Não foi possível alterar a verificação em duas etapas."));
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <>
      {props.mode === "delete" ? (
        <button type="button" onClick={openConfirmation} className={accountRow + " hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40"}>
          <Trash2 size={18} aria-hidden="true" className="shrink-0" />
          <span className="flex-1">Excluir conta</span>
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      ) : (
        <button type="button" role="switch" aria-checked={props.enabled} onClick={openConfirmation}
          className={accountRow + " hover:border-emerald-300 dark:hover:border-emerald-700"}>
          <ShieldCheck size={18} aria-hidden="true" className="shrink-0" />
          <span className="flex-1">Verificação em duas etapas</span>
          <span aria-hidden="true" className={`relative h-5 w-9 shrink-0 rounded-full transition ${props.enabled ? "bg-emerald-700" : "bg-slate-500"}`}>
            <span className={`absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow transition-transform ${props.enabled ? "translate-x-4" : ""}`} />
          </span>
        </button>
      )}

      <Modal open={open} onClose={closeConfirmation}>
        <form onSubmit={confirm} className="space-y-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className={`flex h-16 w-16 items-center justify-center rounded-full ${deleting ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
              <Icon size={32} aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">{action}?</h3>
            <p className="text-sm text-slate-600">
              {deleting ? "Digite sua senha para confirmar a exclusão definitiva da conta." : "Digite sua senha para confirmar a alteração."}
            </p>
          </div>
          <FormInput name="password" label="Senha atual" type="password" autoComplete="current-password" required maxLength={128} disabled={busy}
            value={password} onChange={(event) => setPassword(event.target.value)} />
          {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeConfirmation} disabled={busy}
              className="flex-1 rounded-lg border border-slate-200 px-2 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50">Voltar</button>
            <button type="submit" disabled={busy || !password}
              className={`flex-1 rounded-lg px-2 py-3 text-sm font-semibold text-white disabled:opacity-50 ${deleting ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-700 hover:bg-emerald-800"}`}>
              {busy ? "Confirmando..." : action}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
