"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, ChevronLeft, ChevronRight, FileClock, FilePlus2, LogOut, Menu, UserCircle2, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getStoredAvatarUrl, getStoredUserName } from "@/app/service/api/auth-session";
import { authService } from "@/app/service/api/authService";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import ErrorModal from "@/components/ui/modal/ErrorModal";
import reciclaLogo from "@/assets/Images/LogoImage.png";

type MasterShellProps = {
  children: React.ReactNode;
};

const navItems = [
  { href: "/main/Master", label: "Visão geral", icon: BarChart3 },
  { href: "/main/Master/new-admin", label: "Cadastrar vendedor", icon: UserPlus },
  { href: "/main/Master/new-cooperative", label: "Cadastrar cooperativa", icon: UserPlus },
  { href: "/main/Master/logs", label: "Atividade recente", icon: FileClock },
  { href: "/main/Master/terms", label: "Cadastrar termos", icon: FilePlus2 },
];

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "M";

export const MasterShell = ({ children }: MasterShellProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const userName = getStoredUserName() ?? "Master";
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => getStoredAvatarUrl());

  useEffect(() => {
    const refreshAvatar = () => setAvatarUrl(getStoredAvatarUrl());
    window.addEventListener("profile-updated", refreshAvatar);
    return () => window.removeEventListener("profile-updated", refreshAvatar);
  }, []);

  const initials = useMemo(() => getInitials(userName), [userName]);
  const currentPageLabel = pathname === "/main/Master/profile"
    ? "Perfil"
    : navItems.find((item) => item.href === pathname)?.label ?? "Visão geral";

  const handleLogout = async () => {
    await authService.logout();
    router.replace("/Auth/Login");
  };

  return (
    <div className="product-workspace min-h-screen text-slate-900 dark:text-slate-100">
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        <aside className={`editorial-surface overflow-hidden border-x-0 border-t-0 px-5 py-5 transition-[width,padding] duration-300 ease-out lg:sticky lg:top-0 lg:min-h-screen lg:self-start lg:border-b-0 lg:border-r ${sidebarCollapsed ? "lg:w-20 lg:px-3" : "lg:w-72 lg:px-6"}`}>
          <div className="flex items-center justify-between lg:justify-start lg:gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-0.5 shadow-sm ring-1 ring-emerald-100">
              <Image src={reciclaLogo} alt="Logo ReciclaOnline" className="h-full w-full object-contain" priority />
            </div>
            <div className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ${sidebarCollapsed ? "lg:max-w-0 lg:opacity-0" : "lg:max-w-44 lg:opacity-100"}`}>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">
                Área Master
              </p>
              <h1 className="text-xl font-semibold text-slate-900">
                ReciclaOnline
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu size={18} />
            </button>
          </div>

          <nav
            className={`${menuOpen ? "mt-6 flex" : "mt-6 hidden lg:flex"} flex-col gap-2`}
          >
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={sidebarCollapsed ? item.label : undefined}
                  aria-label={item.label}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center overflow-hidden border-l-2 py-3 text-sm font-medium transition ${sidebarCollapsed ? "lg:justify-center lg:px-2" : "gap-3 px-4"} ${
                    active
                      ? "border-emerald-700 bg-emerald-50 text-emerald-900 dark:bg-slate-800 dark:text-emerald-300"
                      : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-950"
                  }`}
                >
                  <Icon className="shrink-0" size={18} />
                  <span className={`whitespace-nowrap transition-[max-width,opacity] duration-200 ${sidebarCollapsed ? "lg:max-w-0 lg:opacity-0" : "lg:max-w-52 lg:opacity-100"}`}>{item.label}</span>
                </Link>
              );
            })}
            <div className="my-2 border-t border-slate-200" />
            <Link href="/main/Master/profile" title={sidebarCollapsed ? "Perfil" : undefined} aria-label="Perfil" onClick={() => setMenuOpen(false)} className={`flex items-center overflow-hidden border-l-2 py-3 text-sm font-medium transition ${sidebarCollapsed ? "lg:justify-center lg:px-2" : "gap-3 px-4"} ${pathname === "/main/Master/profile" ? "border-emerald-700 bg-emerald-50 text-emerald-900 dark:bg-slate-800 dark:text-emerald-300" : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-950"}`}><UserCircle2 className="shrink-0" size={18} /><span className={`whitespace-nowrap transition-[max-width,opacity] duration-200 ${sidebarCollapsed ? "lg:max-w-0 lg:opacity-0" : "lg:max-w-52 lg:opacity-100"}`}>Perfil</span></Link>
            <button type="button" onClick={() => setSidebarCollapsed((value) => !value)} title={sidebarCollapsed ? "Expandir menu" : "Recolher menu"} aria-label={sidebarCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"} className="mt-3 hidden h-10 w-full shrink-0 items-center justify-center gap-2 overflow-hidden rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 lg:flex">{sidebarCollapsed ? <ChevronRight size={18} /> : <><ChevronLeft className="shrink-0" size={18} /><span className="whitespace-nowrap">Recolher menu</span></>}</button>
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="editorial-surface border-x-0 border-t-0 px-5 py-3 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="min-w-0 truncate text-lg font-semibold text-slate-900">{currentPageLabel}</h2>

              <div className="flex items-center gap-3">
              <ThemeToggle compact />
              <Link
                href="/main/Master/profile"
                className="group flex items-center gap-2 rounded-xl px-1.5 py-1 transition hover:bg-slate-50"
              >
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt={userName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold leading-tight text-slate-900 group-hover:text-emerald-700">
                    {userName}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">Master</p>
                </div>
              </Link>
              </div>
            </div>
          </header>

          <main className="flex-1 px-5 py-7 lg:px-10 lg:py-10">{children}</main>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setLogoutOpen(true)}
        className="rounded-3xl fixed bottom-5 right-5 inline-flex items-center gap-2 bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
      >
        <LogOut size={16} />
        Sair
      </button>
      <ErrorModal
        open={logoutOpen}
        title="Sair da conta?"
        message="Tem certeza que deseja encerrar sua sessão?"
        closeLabel="Cancelar"
        confirmLabel="Sair"
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default MasterShell;
