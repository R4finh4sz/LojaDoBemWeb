"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, ChevronLeft, ChevronRight, Clock3, Download, KeyRound, MapPin, Monitor } from "lucide-react";
import { getStoredAvatarUrl, getStoredUserEmail, setStoredAvatarUrl } from "@/app/service/api/auth-session";
import { apiError, http } from "@/app/service/api/http";
import { useApiResource } from "@/app/service/api/use-api-resource";
import { demoEnabled } from "@/app/service/api/demo-config";
import { useGlobalModalStore } from "@/stores/useGlobalModalStore";
import { AccountSecurity, accountRow } from "./account-security";
import { ChangePassword } from "./change-password";
import { allowedPhoto, ProfileDetails, type AccountProfile } from "./profile-details";

const accountSections = [
  { id: "access", label: "Histórico de acesso", icon: Clock3 },
  { id: "password", label: "Alterar senha", icon: KeyRound },
] as const;
const backLink = "inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:underline dark:text-emerald-300";
const accountButton = accountRow + " hover:border-emerald-300 dark:hover:border-emerald-700";

type Session = {
  id: string; createdAt: string; browser: string | null; device: string | null;
  city: string | null; region: string | null; status: "CURRENT" | "REVOKED" | "EXPIRED" | "ACTIVE";
};
type History = { sessions: Session[]; pagination: { totalPages: number } };
const sessionStatus = { CURRENT: "Sessão atual", REVOKED: "Encerrada", EXPIRED: "Expirada", ACTIVE: "Ativa" };

type ProfilePageProps = {
  roleLabel?: "Master" | "Vendedor da Prefeitura" | "Cooperativa";
  onProfileSaved?: (profile: AccountProfile) => void;
  onBack?: () => void;
  accountResource?: { data?: AccountProfile; error?: string; retry: () => void };
};

export const ProfilePage = ({ roleLabel = "Master", onProfileSaved, onBack, accountResource }: ProfilePageProps) => {
  const [section, setSection] = useState<(typeof accountSections)[number]["id"] | null>(null);
  const [profileRefresh, setProfileRefresh] = useState(0);
  const profile = useApiResource<AccountProfile>(accountResource ? null : "account/profile", profileRefresh);
  const [savedProfile, setSavedProfile] = useState<AccountProfile | null>(null);
  const [exporting, setExporting] = useState(false);
  const showError = useGlobalModalStore((state) => state.showError);
  const details = savedProfile ?? (accountResource ?? profile)?.data;
  const profileError = (accountResource ?? profile)?.error;
  const cachedPhoto = details ? null : getStoredAvatarUrl();
  const userEmail = details?.email ?? getStoredUserEmail() ?? "";
  function saveProfile(data: AccountProfile) {
    setSavedProfile(data);
    if (data.profilePhoto) setStoredAvatarUrl(data.profilePhoto);
    onProfileSaved?.(data);
  }

  async function exportData() {
    setExporting(true);
    try {
      const { data } = await http.get<unknown>("account/export?format=json");
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "meus-dados.json";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      showError(apiError(error, "Não foi possível exportar seus dados."));
    } finally {
      setExporting(false);
    }
  }

  return (
    <section aria-labelledby="my-profile" className="mx-auto max-w-6xl space-y-8">
      <header className="space-y-5">
        {onBack ? (
          <button type="button" onClick={onBack} className={backLink}><ArrowLeft size={16} aria-hidden="true" />Voltar</button>
        ) : (
          <Link href="/main/Master" className={backLink}><ArrowLeft size={16} aria-hidden="true" />Voltar</Link>
        )}
        <h3 id="my-profile" className="text-3xl font-semibold tracking-tight sm:text-4xl">Meu perfil</h3>
      </header>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        {details ? <ProfileDetails profile={details} onSaved={saveProfile} /> : (
          <div className="space-y-3">
            {allowedPhoto(cachedPhoto) && (
              <Image src={cachedPhoto} alt="Foto de perfil" width={144} height={144} unoptimized
                className="mx-auto size-36 rounded-full object-cover" />
            )}
            <p role={profileError ? "alert" : "status"} className="text-sm text-slate-600 dark:text-slate-300">
              {profileError ?? "Carregando seus dados..."}
            </p>
            {profileError && (
              <button type="button" className={backLink} onClick={accountResource?.retry ?? (() => setProfileRefresh((value) => value + 1))}>
                Tentar novamente
              </button>
            )}
          </div>
        )}
        {section ? (
          <div className="min-w-0 space-y-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900 sm:p-6">
            <button type="button" onClick={() => setSection(null)} className={backLink}><ArrowLeft size={16} aria-hidden="true" />Voltar às opções da conta</button>
            {section === "access" && <AccessHistory />}
            {section === "password" && <ChangePassword email={userEmail} managed={roleLabel === "Master" && !demoEnabled} />}
          </div>
        ) : (
          <section aria-labelledby="profile-account" className="min-w-0 space-y-3">
            <h4 id="profile-account" className="text-base font-semibold">Conta</h4>
            {details && typeof details.twoFactorEnabled === "boolean" && (
              <AccountSecurity key="two-factor" mode="two-factor" enabled={details.twoFactorEnabled}
                onChanged={(enabled) => setSavedProfile((current) => ({ ...(current ?? details), twoFactorEnabled: enabled }))} />
            )}
            {accountSections.map(({ id, label, icon: Icon }) => (
              <button type="button" key={id} onClick={() => setSection(id)} className={accountButton}>
                <Icon size={18} aria-hidden="true" className="shrink-0" />
                <span className="flex-1">{label}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            ))}
            <button type="button" onClick={exportData} disabled={exporting} className={accountButton + " disabled:opacity-60"}>
              <Download size={18} aria-hidden="true" className="shrink-0" />
              <span className="flex-1">{exporting ? "Exportando..." : "Exportar meus dados em JSON"}</span>
              <ArrowRight size={16} aria-hidden="true" />
            </button>
            <Link href="/main/termos-de-uso" className={accountButton}>
              <BookOpen size={18} aria-hidden="true" className="shrink-0" />
              <span className="flex-1">Termos de uso</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <AccountSecurity key="delete" mode="delete" />
          </section>
        )}
      </div>
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
