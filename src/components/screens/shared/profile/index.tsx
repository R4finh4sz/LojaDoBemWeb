"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Camera, Clock3, KeyRound, UserCircle2, UserRoundPen } from "lucide-react";
import { getStoredAvatarUrl, getStoredUserEmail, getStoredUserName, setStoredAvatarUrl } from "@/app/service/api/auth-session";
import { apiError, http } from "@/app/service/api/http";
import { authService } from "@/app/service/api/authService";
import { useApiResource } from "@/app/service/api/use-api-resource";
import { FormInput } from "@/components/ui/form-input";
import { useGlobalModalStore } from "@/stores/useGlobalModalStore";
import ErrorModal from "@/components/ui/modal/ErrorModal";

type ProfileTab = "access" | "password" | "data" | "terms";
const tabs = [
  { id: "access", label: "Histórico de acesso", icon: Clock3 },
  { id: "password", label: "Alterar senha", icon: KeyRound },
  { id: "data", label: "Meus dados", icon: UserRoundPen },
] satisfies { id: ProfileTab; label: string; icon: typeof Clock3 }[];

type Session = {
  id: string; createdAt: string; browser: string | null; device: string | null;
  city: string | null; region: string | null; status: "CURRENT" | "REVOKED" | "EXPIRED" | "ACTIVE";
};
type History = { sessions: Session[]; pagination: { totalPages: number } };
const sessionStatus = { CURRENT: "Sessão atual", REVOKED: "Encerrada", EXPIRED: "Expirada", ACTIVE: "Ativa" };

type ProfilePageProps = {
  roleLabel?: "Master" | "Vendedor da Prefeitura" | "Cooperativa";
};

export const ProfilePage = ({ roleLabel = "Master" }: ProfilePageProps) => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const history = useApiResource<History>("account/sessions?page=" + page);
  const [tab, setTab] = useState<ProfileTab>("access");
  const [preview, setPreview] = useState<string | null>(() => getStoredAvatarUrl());
  const [logoutOpen, setLogoutOpen] = useState(false);
  const showError = useGlobalModalStore((state) => state.showError);
  const [exporting, setExporting] = useState(false);
  const userName = getStoredUserName() ?? roleLabel;
  const userEmail = getStoredUserEmail() ?? "";
  const profileTabs = [...tabs, { id: "terms" as const, label: "Termos de uso", icon: BookOpen }];
  const logout = async () => { await authService.logout(); router.replace("/Auth/Login"); };
  async function exportData() {
    setExporting(true);
    try {
      const { data } = await http.get<Blob>("account/export", { responseType: "blob" });
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = "meus-dados.pdf";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      showError(apiError(error, "Não foi possível exportar seus dados."));
    } finally {
      setExporting(false);
    }
  }

  const selectPhoto = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      setPreview(reader.result);
      setStoredAvatarUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.14)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-emerald-100 text-emerald-700 shadow-md">
            {preview ? (
              <img src={preview} alt="Prévia do perfil" className="h-full w-full object-cover" />
            ) : <UserCircle2 size={42} />}
          </div>
          <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">Perfil {roleLabel}</p><h3 className="mt-1 text-2xl font-bold">{userName}</h3></div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        <nav className="h-fit rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_18px_48px_rgba(15,23,42,0.14)]">
          {profileTabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} className={`mb-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold last:mb-0 ${tab === id ? "bg-emerald-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"}`}><Icon size={18} />{label}</button>)}
        </nav>

        <article className="min-h-[430px] rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.14)] sm:p-8">
          {tab === "access" && (
            <section>
              <h4 className="text-2xl font-bold">Histórico de acesso</h4>
              {!history?.data ? (
                <p className="mt-4" role={history?.error ? "alert" : "status"}>{history?.error ?? "Carregando sessões..."}</p>
              ) : (
                <>
                  {history.data.sessions.length === 0 && <p className="mt-4">Nenhuma sessão encontrada.</p>}
                  <ul className="mt-6 divide-y divide-slate-200">
                    {history.data.sessions.map((session) => (
                      <li key={session.id} className="grid gap-2 py-4 text-sm sm:grid-cols-4">
                        <strong>{new Date(session.createdAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</strong>
                        <span>{[session.browser, session.device].filter(Boolean).join(" · ") || "Dispositivo indisponível"}</span>
                        <span>{[session.city, session.region].filter(Boolean).join(", ") || "Local indisponível"}</span>
                        <span>{sessionStatus[session.status]}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <button disabled={page === 1} className="disabled:opacity-50" onClick={() => setPage(page - 1)}>Anterior</button>
                    <span>Página {page}</span>
                    <button disabled={page >= history.data.pagination.totalPages} className="disabled:opacity-50" onClick={() => setPage(page + 1)}>Próxima</button>
                  </div>
                </>
              )}
            </section>
          )}

          {tab === "password" && (
            <section className="space-y-4">
              <h4 className="text-2xl font-bold">Alterar senha</h4>
              <p>Use o código enviado ao seu e-mail para definir uma nova senha.</p>
              <a href="/Auth/ForgotPassword" className="inline-block rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white">Redefinir senha</a>
            </section>
          )}

          {tab === "data" && (
            <section>
              <h4 className="text-2xl font-bold">Meus dados</h4>
              <div className="mt-6 grid gap-6 sm:grid-cols-[160px_1fr]">
                <label className="flex h-36 w-36 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-emerald-300 bg-emerald-50 text-center">
                  {preview ? <img src={preview} alt="Foto do perfil" className="h-full w-full object-cover" /> : <><Camera className="text-emerald-700" size={30} /><span className="mt-2 text-xs font-semibold">Alterar foto neste navegador</span></>}
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => selectPhoto(event.target.files?.[0])} />
                </label>
                <div className="space-y-4">
                  <FormInput value={userEmail} readOnly type="email" label="E-mail" />
                  <FormInput value={roleLabel} readOnly label="Função" />
                  <button disabled={exporting} onClick={exportData} className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
                    {exporting ? "Gerando PDF..." : "Exportar meus dados em PDF"}
                  </button>
                </div>
              </div>
            </section>
          )}

          {tab === "terms" && <CurrentTerm />}
        </article>
      </div>
      <ErrorModal open={logoutOpen} title="Sair da conta?" message="Tem certeza que deseja encerrar sua sessão?" closeLabel="Cancelar" confirmLabel="Sair" onClose={() => setLogoutOpen(false)} onConfirm={logout} />
    </section>
  );
};

export const MasterProfilePage = () => <ProfilePage roleLabel="Master" />;

export default MasterProfilePage;

function CurrentTerm() {
  const term = useApiResource<{ term: { title: string | null; text: string } }>("terms/current");
  return (
    <section>
      <h4 className="text-2xl font-bold">{term?.data?.term.title ?? "Termos de uso"}</h4>
      {term?.data ? <p className="mt-4 whitespace-pre-wrap leading-7">{term.data.term.text}</p> :
        <p className="mt-4" role={term?.error ? "alert" : "status"}>{term?.error ?? "Carregando termo vigente..."}</p>}
    </section>
  );
}
