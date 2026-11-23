"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronLeft, ChevronRight, Clock3, KeyRound, MapPin, Monitor, UserCircle2, UserRoundPen } from "lucide-react";
import { getStoredAvatarUrl, getStoredUserEmail, getStoredUserName, setStoredAvatarUrl } from "@/app/service/api/auth-session";
import { authService } from "@/app/service/api/authService";
import { useApiResource } from "@/app/service/api/use-api-resource";
import ErrorModal from "@/components/ui/modal/ErrorModal";
import { demoEnabled } from "@/app/service/api/demo-config";
import { ChangePassword } from "./change-password";
import { ProfileDetails, type AccountProfile } from "./profile-details";

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
  const [tab, setTab] = useState<ProfileTab>("access");
  const profile = useApiResource<AccountProfile>("account/profile");
  const [savedProfile, setSavedProfile] = useState<AccountProfile | null>(null);
  const details = savedProfile ?? profile?.data;
  const preview = details?.profilePhoto ?? getStoredAvatarUrl();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const userName = getStoredUserName() ?? roleLabel;
  const userEmail = details?.email ?? getStoredUserEmail() ?? "";
  const profileTabs = [...tabs, { id: "terms" as const, label: "Termos de uso", icon: BookOpen }];
  const logout = async () => { await authService.logout(); router.replace("/Auth/Login"); };
  function saveProfile(data: AccountProfile) {
    setSavedProfile(data);
    if (data.profilePhoto) setStoredAvatarUrl(data.profilePhoto);
  }

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
          {profileTabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} className={`mb-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold last:mb-0 ${tab === id ? "bg-emerald-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"}`}><Icon size={18} />{label}</button>)}
        </nav>

        <article className="self-start rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.14)] sm:p-8">
          {tab === "access" && <AccessHistory />}
          {tab === "password" && <ChangePassword email={userEmail} managed={roleLabel === "Master" && !demoEnabled} />}

          {tab === "data" && (details ? (
            <ProfileDetails profile={details} roleLabel={roleLabel} onSaved={saveProfile} />
          ) : (
            <p role={profile?.error ? "alert" : "status"} className="text-sm text-slate-600">
              {profile?.error ?? "Carregando seus dados..."}
            </p>
          ))}

          {tab === "terms" && <CurrentTerm />}
        </article>
      </div>
      <ErrorModal open={logoutOpen} title="Sair da conta?" message="Tem certeza que deseja encerrar sua sessão?" closeLabel="Cancelar" confirmLabel="Sair" onClose={() => setLogoutOpen(false)} onConfirm={logout} />
    </section>
  );
};

export const MasterProfilePage = () => <ProfilePage roleLabel="Master" />;

export default MasterProfilePage;

const accessDate = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });
const historyButton = "inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 dark:hover:bg-slate-800 sm:px-3";

function AccessHistory() {
  const [page, setPage] = useState(1);
  const history = useApiResource<History>("account/sessions?page=" + page);
  const data = history?.data;

  return (
    <section className="space-y-4">
      <h4 className="flex items-center gap-2.5 text-2xl font-bold">
        <Clock3 size={22} aria-hidden="true" className="shrink-0 text-emerald-700 dark:text-emerald-300" />
        Histórico de acesso
      </h4>
      {!data ? (
        <p role={history?.error ? "alert" : "status"} className="text-sm text-slate-600">{history?.error ?? "Carregando sessões..."}</p>
      ) : data.sessions.length === 0 ? (
        <p className="text-sm text-slate-600">Nenhuma sessão encontrada.</p>
      ) : (
        <ul className="space-y-3">
          {data.sessions.map((session) => (
            <li key={session.id} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-2 font-semibold"><Monitor size={16} aria-hidden="true" className="shrink-0" />
                  {[session.browser, session.device].filter(Boolean).join(" · ") || "Dispositivo indisponível"}
                </p>
                <span className={session.status === "CURRENT"
                  ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                  : "rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600"}>
                  {sessionStatus[session.status]}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600">
                <time dateTime={session.createdAt} className="inline-flex items-center gap-1.5">
                  <Clock3 size={14} aria-hidden="true" />{accessDate.format(new Date(session.createdAt))}
                </time>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={14} aria-hidden="true" />{[session.city, session.region].filter(Boolean).join(", ") || "Local indisponível"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      {(page > 1 || (data?.pagination.totalPages ?? 0) > 1) && (
        <nav aria-label="Paginação do histórico" className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <button type="button" disabled={page === 1} onClick={() => setPage(page - 1)} className={historyButton + " justify-self-start"}>
            <ChevronLeft size={15} aria-hidden="true" />Anterior
          </button>
          <span className="text-sm">Página {page}</span>
          <button type="button" disabled={!data || page >= data.pagination.totalPages} onClick={() => setPage(page + 1)} className={historyButton + " justify-self-end"}>
            Próxima<ChevronRight size={15} aria-hidden="true" />
          </button>
        </nav>
      )}
    </section>
  );
}

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
