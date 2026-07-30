"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, Shield } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  clearAuthSession,
  getStoredAvatarUrl,
  getStoredUserName,
} from "@/app/service/api/auth-session";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import ErrorModal from "@/components/ui/modal/ErrorModal";

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
  const [logoutOpen, setLogoutOpen] = useState(false);
  const userName = getStoredUserName() ?? "Master";
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => getStoredAvatarUrl());

  useEffect(() => {
    const refreshAvatar = () => setAvatarUrl(getStoredAvatarUrl());
    window.addEventListener("profile-updated", refreshAvatar);
    return () => window.removeEventListener("profile-updated", refreshAvatar);
  }, []);

  const initials = useMemo(() => getInitials(userName), [userName]);

  const handleLogout = () => {
    clearAuthSession();
    router.replace("/Auth/Login");
  };

  return (
    <div className="product-workspace min-h-screen text-slate-900 dark:text-slate-100">
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        <aside className="editorial-surface border-x-0 border-t-0 px-5 py-5 lg:sticky lg:top-0 lg:min-h-screen lg:w-72 lg:self-start lg:border-b-0 lg:border-r lg:px-6">
          <div className="flex items-center justify-between lg:justify-start lg:gap-3">
            <div className="flex h-11 w-11 items-center justify-center bg-emerald-700 text-white">
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
                  className={`border-l-2 px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "border-emerald-700 bg-emerald-50 text-emerald-900 dark:bg-slate-800 dark:text-emerald-300"
                      : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-950"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="editorial-surface sticky top-0 z-20 border-x-0 border-t-0 px-5 py-4 lg:px-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-600">
                  Controle da plataforma
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                  Operação Master
                </h2>
              </div>

              <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link
                href="/main/Master/profile"
                className="group flex items-center gap-3 self-start bg-transparent px-1 py-1 transition"
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
