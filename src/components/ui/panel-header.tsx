"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import reciclaLogo from "@/assets/Images/LogoImage.png";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function panelNavItemClass(active: boolean) {
  return "inline-flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 " +
    (active ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300" :
      "text-slate-600 enabled:hover:bg-slate-50 dark:text-slate-300 dark:enabled:hover:bg-slate-800");
}

type Props = {
  area: string;
  children: ReactNode;
  name?: string | null;
  photo?: string | null;
  profileActive: boolean;
  profile: { href: string } | { onClick: () => void };
  onLogout: () => void;
  logoutDisabled?: boolean;
};

export function PanelHeader({ area, children, name, photo, profileActive, profile, onLogout, logoutDisabled }: Props) {
  const [givenName = "", surname = ""] = name?.trim().split(/\s+/) ?? [];
  const firstName = givenName.charAt(0).toLocaleUpperCase("pt-BR") + givenName.slice(1);
  const initials = (givenName.charAt(0) + surname.charAt(0)).toLocaleUpperCase("pt-BR");
  const profileProps = {
    "aria-label": firstName ? `Abrir perfil de ${firstName}` : "Abrir perfil",
    "aria-current": profileActive ? ("page" as const) : undefined,
    className: "flex min-w-0 items-center gap-2 rounded-xl px-1.5 py-1 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800",
  };
  const identity = (
    <>
      <span aria-hidden="true" className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-emerald-700 text-sm font-bold text-white">
        {photo ? <Image src={photo} alt="" fill unoptimized sizes="40px" className="object-cover" /> : initials || <UserRound size={18} />}
      </span>
      {firstName && <span className="min-w-0 break-words">{firstName}</span>}
    </>
  );

  return (
    <header className="editorial-surface grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1 border-x-0 border-t-0 px-4 py-2 sm:px-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-x-5 lg:px-8">
      <div className="col-start-1 row-start-1 flex min-w-0 items-center gap-2.5">
        <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-white p-0.5 shadow-sm ring-1 ring-emerald-100 sm:size-11">
          <Image src={reciclaLogo} alt="ReciclaOnline" className="h-full w-full object-contain" priority />
        </div>
        <div className="hidden sm:block">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">{area}</p>
          <p className="text-lg font-semibold leading-tight">ReciclaOnline</p>
        </div>
      </div>
      <nav aria-label={`Navegação · ${area}`} className="col-span-2 row-start-2 flex min-w-0 gap-1 overflow-x-auto py-1 lg:col-span-1 lg:col-start-2 lg:row-start-1 xl:justify-[safe_center]">
        {children}
      </nav>
      <div className="col-start-2 row-start-1 flex min-w-0 items-center gap-2 justify-self-end lg:col-start-3">
        <ThemeToggle compact />
        {"href" in profile ? <Link href={profile.href} {...profileProps}>{identity}</Link> :
          <button type="button" onClick={profile.onClick} {...profileProps}>{identity}</button>}
        <button type="button" onClick={onLogout} disabled={logoutDisabled} aria-label="Sair"
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800 sm:px-3">
          <LogOut size={16} aria-hidden="true" /><span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
