"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, Shield, UserCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  clearAuthSession,
  getStoredAvatarUrl,
  getStoredUserName,
} from "@/app/service/api/auth-session";

type MasterShellProps = {
  children: React.ReactNode;
};

const navItems = [
  { href: "/main/Master", label: "Painel" },
  { href: "/main/Master/logs", label: "Logs" },
  { href: "/main/Master/new-admin", label: "Novo administrador" },
  { href: "/main/Master/terms", label: "Termos de uso" },
  { href: "/main/Master/profile", label: "Perfil" },
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
  const userName = getStoredUserName() ?? "Master";
  const avatarUrl = getStoredAvatarUrl();

  const initials = useMemo(() => getInitials(userName), [userName]);

  const handleLogout = () => {
    clearAuthSession();
    router.replace("/Auth/Login");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_30%),linear-gradient(180deg,#f0fff8_0%,#e8f8f1_42%,#f8fafc_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-emerald-100/80 bg-white/85 px-5 py-5 backdrop-blur-xl lg:min-h-screen lg:w-80 lg:border-b-0 lg:border-r lg:px-6">
          <div className="flex items-center justify-between lg:justify-start lg:gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
              <Shield size={22} />
            </div>
            <div>
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
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                      : "bg-emerald-50 text-slate-600 hover:bg-emerald-100 hover:text-emerald-800"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-3xl border border-emerald-100 bg-emerald-50 p-5 text-slate-800 shadow-[0_14px_40px_rgba(16,185,129,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
              Status
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-900">
              Operação ativa
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Logs e cadastros estão sendo monitorados em tempo real.
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-white/70 bg-white/85 px-5 py-4 backdrop-blur-xl lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-600">
                  Painel do Master
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                  Gestão avançada da plataforma
                </h2>
              </div>

              <Link
                href="/main/Master/profile"
                className="group flex items-center gap-3 self-start rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white">
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
                <div className="text-left">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">
                    Master
                  </p>
                  <p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700">
                    {userName}
                  </p>
                </div>
              </Link>
            </div>
          </header>

          <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="fixed bottom-5 right-5 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-2xl shadow-emerald-600/25 transition hover:bg-emerald-700"
      >
        <LogOut size={16} />
        Sair
      </button>
    </div>
  );
};

export default MasterShell;
