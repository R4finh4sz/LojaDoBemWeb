"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BarChart3, ChevronLeft, ChevronRight, ClipboardCheck, FileSearch, LogOut, Menu, PackagePlus, Pencil, ShoppingBag, UserCircle2, UserPlus } from "lucide-react";
import { authService } from "@/app/service/api/authService";
import AuthGuard from "@/components/ui/auth-guard";
import { getStoredAvatarUrl, getStoredUserName } from "@/app/service/api/auth-session";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ProfilePage } from "@/components/screens/shared/profile";
import ErrorModal from "@/components/ui/modal/ErrorModal";
import { CitizenRegistration } from "@/components/screens/admin/citizen-registration";
import { CreateProduct, Inventory, MunicipalDashboard, ValidatePickup } from "@/components/screens/admin/municipal";
import { AdminStore } from "@/components/screens/admin/store";
import { SaleHistory } from "@/components/screens/admin/store/sale-history";
import reciclaLogo from "@/assets/Images/LogoImage.png";

type AdminTab = "overview" | "citizen" | "store" | "sales" | "items" | "catalog" | "withdrawal" | "profile";
const tabs = [
  { id: "overview", label: "Visão geral", icon: BarChart3 },
  { id: "citizen", label: "Pré-cadastrar munícipe", icon: UserPlus },
  { id: "store", label: "Loja", icon: ShoppingBag },
  { id: "sales", label: "Histórico de vendas", icon: FileSearch },
  { id: "items", label: "Cadastrar item", icon: PackagePlus },
  { id: "catalog", label: "Estoque", icon: Pencil },
  { id: "withdrawal", label: "Confirmar retirada", icon: ClipboardCheck },
] satisfies { id: AdminTab; label: string; icon: typeof BarChart3 }[];

export const AdminHome = () => {
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [saleProtocol, setSaleProtocol] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const adminName = getStoredUserName() ?? "Vendedor da Prefeitura";
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => getStoredAvatarUrl());
  const initials = useMemo(() => adminName.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "A", [adminName]);
  const currentTabLabel = tab === "profile" ? "Perfil" : tabs.find((item) => item.id === tab)?.label ?? "Visão geral";

  useEffect(() => {
    const refreshAvatar = () => setAvatarUrl(getStoredAvatarUrl());
    window.addEventListener("profile-updated", refreshAvatar);
    return () => window.removeEventListener("profile-updated", refreshAvatar);
  }, []);

  const logout = async () => {
    await authService.logout();
    router.replace("/Auth/Login");
  };

  return (
    <AuthGuard title="Painel da Prefeitura" allowedRoles="PrefeituraVendedor">
      <div className="product-workspace min-h-screen text-slate-900 dark:text-slate-100">
        <div className="flex min-h-screen w-full flex-col lg:flex-row">
          <aside className={`editorial-surface overflow-hidden border-x-0 border-t-0 px-5 py-5 transition-[width,padding] duration-300 ease-out lg:sticky lg:top-0 lg:min-h-screen lg:self-start lg:border-b-0 lg:border-r ${sidebarCollapsed ? "lg:w-20 lg:px-3" : "lg:w-72 lg:px-6"}`}>
            <div className="flex items-center justify-between lg:justify-start lg:gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-0.5 shadow-sm ring-1 ring-emerald-100"><Image src={reciclaLogo} alt="Logo ReciclaOnline" className="h-full w-full object-contain" priority /></div>
              <div className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ${sidebarCollapsed ? "lg:max-w-0 lg:opacity-0" : "lg:max-w-44 lg:opacity-100"}`}><p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">Prefeitura</p><h1 className="text-xl font-semibold text-slate-900">ReciclaOnline</h1></div>
              <button type="button" onClick={() => setMenuOpen((value) => !value)} className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden" aria-label="Abrir menu"><Menu size={18} /></button>
            </div>
            <nav className={`${menuOpen ? "mt-6 flex" : "mt-6 hidden lg:flex"} flex-col gap-2`}>
              {tabs.map(({ id, label, icon: Icon }) => <button key={id} title={sidebarCollapsed ? label : undefined} aria-label={label} onClick={() => { setTab(id); setMenuOpen(false); }} className={`flex w-full items-center overflow-hidden border-l-2 py-3 text-left text-sm font-medium transition ${sidebarCollapsed ? "lg:justify-center lg:px-2" : "gap-3 px-4"} ${tab === id ? "border-emerald-700 bg-emerald-50 text-emerald-900 dark:bg-slate-800 dark:text-emerald-300" : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-950"}`}><Icon className="shrink-0" size={18} /><span className={`whitespace-nowrap transition-[max-width,opacity] duration-200 ${sidebarCollapsed ? "lg:max-w-0 lg:opacity-0" : "lg:max-w-52 lg:opacity-100"}`}>{label}</span></button>)}
              <div className="my-2 border-t border-slate-200" />
              <button title={sidebarCollapsed ? "Perfil" : undefined} aria-label="Perfil" onClick={() => { setTab("profile"); setMenuOpen(false); }} className={`flex w-full items-center overflow-hidden border-l-2 py-3 text-left text-sm font-medium transition ${sidebarCollapsed ? "lg:justify-center lg:px-2" : "gap-3 px-4"} ${tab === "profile" ? "border-emerald-700 bg-emerald-50 text-emerald-900 dark:bg-slate-800 dark:text-emerald-300" : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-950"}`}><UserCircle2 className="shrink-0" size={18} /><span className={`whitespace-nowrap transition-[max-width,opacity] duration-200 ${sidebarCollapsed ? "lg:max-w-0 lg:opacity-0" : "lg:max-w-52 lg:opacity-100"}`}>Perfil</span></button>
              <button type="button" onClick={() => setSidebarCollapsed((value) => !value)} title={sidebarCollapsed ? "Expandir menu" : "Recolher menu"} aria-label={sidebarCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"} className="mt-3 hidden h-10 w-full shrink-0 items-center justify-center gap-2 overflow-hidden rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 lg:flex">{sidebarCollapsed ? <ChevronRight size={18} /> : <><ChevronLeft className="shrink-0" size={18} /><span className="whitespace-nowrap">Recolher menu</span></>}</button>
            </nav>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="editorial-surface border-x-0 border-t-0 px-5 py-3 lg:px-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="min-w-0 truncate text-lg font-semibold text-slate-900">{currentTabLabel}</h2>
                <div className="flex items-center gap-2"><ThemeToggle compact /><button type="button" onClick={() => setTab("profile")} className="group flex items-center gap-2 rounded-xl px-1.5 py-1 transition hover:bg-slate-50 dark:hover:bg-slate-800">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white">{avatarUrl ? <img src={avatarUrl} alt={adminName} className="h-full w-full object-cover" /> : <span>{initials}</span>}</div>
                  <div className="hidden text-left sm:block"><p className="text-sm font-semibold leading-tight text-slate-900 group-hover:text-emerald-700">{adminName}</p><p className="mt-0.5 text-xs text-slate-500">Vendedor da Prefeitura</p></div>
                </button>
                  <button type="button" onClick={() => setLogoutOpen(true)} aria-label="Sair"
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:hover:bg-slate-800 sm:px-3">
                    <LogOut size={16} aria-hidden="true" /><span className="hidden sm:inline">Sair</span>
                  </button>
                </div>
              </div>
            </header>

            <main className="editorial-reveal flex-1 px-5 py-7 lg:px-10 lg:py-10">
              <div className="min-w-0">
                {tab === "overview" && <MunicipalDashboard />}
                {tab === "citizen" && <CitizenRegistration />}
                {tab === "store" && <AdminStore onViewProtocol={(protocol) => {
                  setSaleProtocol(protocol);
                  setTab("sales");
                }} />}
                {tab === "sales" && <SaleHistory initialProtocol={saleProtocol} />}
                {tab === "items" && <CreateProduct />}
                {tab === "catalog" && <Inventory />}
                {tab === "withdrawal" && <ValidatePickup />}
                {tab === "profile" && <ProfilePage roleLabel="Vendedor da Prefeitura" />}
              </div>
            </main>
          </div>
        </div>
        <ErrorModal open={logoutOpen} title="Sair da conta?" message="Tem certeza que deseja encerrar sua sessão?" closeLabel="Cancelar" confirmLabel="Sair" onClose={() => setLogoutOpen(false)} onConfirm={logout} />
      </div>
    </AuthGuard>
  );
};

export default AdminHome;
