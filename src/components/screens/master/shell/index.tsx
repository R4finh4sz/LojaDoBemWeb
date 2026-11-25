"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, FileClock, FilePlus2, Landmark, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { getStoredAvatarUrl, getStoredUserName } from "@/app/service/api/auth-session";
import { authService } from "@/app/service/api/authService";
import { PanelHeader, panelNavItemClass } from "@/components/ui/panel-header";
import ErrorModal from "@/components/ui/modal/ErrorModal";

type MasterShellProps = {
  children: React.ReactNode;
};

const navItems = [
  { href: "/main/Master", label: "Visão geral", icon: BarChart3 },
  { href: "/main/Master/municipalities", label: "Prefeituras", icon: Landmark },
  { href: "/main/Master/vendors", label: "Vendedores", icon: UserPlus },
  { href: "/main/Master/cooperatives", label: "Cooperativas", icon: UserPlus },
  { href: "/main/Master/logs", label: "Atividade recente", icon: FileClock },
  { href: "/main/Master/terms", label: "Cadastrar termos", icon: FilePlus2 },
];
const listPaths: Record<string, string> = {
  "/main/Master/new-municipality": "/main/Master/municipalities",
  "/main/Master/new-admin": "/main/Master/vendors",
  "/main/Master/new-cooperative": "/main/Master/cooperatives",
};

export const MasterShell = ({ children }: MasterShellProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const userName = getStoredUserName() ?? "Master";
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => getStoredAvatarUrl());

  useEffect(() => {
    const refreshAvatar = () => setAvatarUrl(getStoredAvatarUrl());
    window.addEventListener("profile-updated", refreshAvatar);
    return () => window.removeEventListener("profile-updated", refreshAvatar);
  }, []);

  const activeHref = listPaths[pathname] ?? pathname;
  const currentPageLabel = pathname === "/main/Master/profile"
    ? "Perfil"
    : navItems.find((item) => item.href === activeHref)?.label ?? "Visão geral";

  const handleLogout = async () => {
    await authService.logout();
    router.replace("/Auth/Login");
  };

  return (
    <div className="product-workspace min-h-screen text-slate-900 dark:text-slate-100">
      <PanelHeader area="Área Master" name={userName} photo={avatarUrl} profileActive={pathname === "/main/Master/profile"}
        profile={{ href: "/main/Master/profile" }} onLogout={() => setLogoutOpen(true)}>
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} aria-current={activeHref === href ? "page" : undefined}
            className={panelNavItemClass(activeHref === href)}>
            <Icon size={17} aria-hidden="true" />{label}
          </Link>
        ))}
      </PanelHeader>
      <main aria-label={currentPageLabel} className="editorial-reveal min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
        {children}
      </main>
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
