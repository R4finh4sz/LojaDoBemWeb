"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, ClipboardCheck, FileSearch, Package, ShoppingBag, UserPlus } from "lucide-react";
import { authService } from "@/app/service/api/authService";
import AuthGuard from "@/components/ui/auth-guard";
import { getStoredAvatarUrl, getStoredUserName } from "@/app/service/api/auth-session";
import { useApiResource } from "@/app/service/api/use-api-resource";
import { PanelHeader, panelNavItemClass } from "@/components/ui/panel-header";
import { ProfilePage } from "@/components/screens/shared/profile";
import type { AccountProfile } from "@/components/screens/shared/profile/profile-details";
import ErrorModal from "@/components/ui/modal/ErrorModal";
import { CitizenRegistrations } from "@/components/screens/admin/citizen-registration/list";
import { Inventory, MunicipalDashboard, ValidatePickup } from "@/components/screens/admin/municipal";
import { AdminStore } from "@/components/screens/admin/store";
import { SaleHistory } from "@/components/screens/admin/store/sale-history";

type AdminTab = "overview" | "citizen" | "store" | "sales" | "catalog" | "withdrawal" | "profile";
const tabs = [
  { id: "overview", label: "Visão geral", icon: BarChart3 },
  { id: "citizen", label: "Munícipes", icon: UserPlus },
  { id: "store", label: "Loja", icon: ShoppingBag },
  { id: "sales", label: "Histórico de vendas", icon: FileSearch },
  { id: "catalog", label: "Estoque", icon: Package },
  { id: "withdrawal", label: "Confirmar retirada", icon: ClipboardCheck },
] satisfies { id: AdminTab; label: string; icon: typeof BarChart3 }[];

export const AdminHome = ({ openProfile = false }: { openProfile?: boolean }) => (
  <AuthGuard title="Painel da Prefeitura" allowedRoles="PrefeituraVendedor">
    <AdminWorkspace openProfile={openProfile} />
  </AuthGuard>
);

function AdminWorkspace({ openProfile }: { openProfile: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>(openProfile ? "profile" : "overview");
  const [saleProtocol, setSaleProtocol] = useState("");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [profileRefresh, setProfileRefresh] = useState(0);
  const account = useApiResource<AccountProfile>("account/profile", profileRefresh);
  const [savedProfile, setSavedProfile] = useState<AccountProfile>();
  const profile = savedProfile ?? account?.data;
  const adminName = profile?.name?.trim() || getStoredUserName()?.trim() || "";
  const avatarUrl = profile?.profilePhoto ?? getStoredAvatarUrl();
  const currentTabLabel = tab === "profile" ? "Perfil" : tabs.find((item) => item.id === tab)?.label ?? "Visão geral";

  const logout = async () => {
    await authService.logout();
    router.replace("/Auth/Login");
  };

  return (
    <div className="product-workspace min-h-screen text-slate-900 dark:text-slate-100">
      <PanelHeader area="Prefeitura" name={adminName} photo={avatarUrl} profileActive={tab === "profile"}
        profile={{ onClick: () => setTab("profile") }} onLogout={() => setLogoutOpen(true)}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button type="button" key={id} disabled={id === "withdrawal"} aria-current={tab === id ? "page" : undefined}
            onClick={() => setTab(id)} className={panelNavItemClass(tab === id)}>
            <Icon size={17} aria-hidden="true" />{label}
          </button>
        ))}
      </PanelHeader>

      <main aria-label={currentTabLabel} className="editorial-reveal min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
        {tab === "overview" && <MunicipalDashboard />}
        {tab === "citizen" && <CitizenRegistrations />}
        {tab === "store" && <AdminStore onViewProtocol={(protocol) => {
          setSaleProtocol(protocol);
          setTab("sales");
        }} />}
        {tab === "sales" && <SaleHistory initialProtocol={saleProtocol} />}
        {tab === "catalog" && <Inventory />}
        {tab === "withdrawal" && <ValidatePickup />}
        {tab === "profile" && (
          <ProfilePage roleLabel="Vendedor da Prefeitura" onProfileSaved={setSavedProfile} onBack={() => setTab("overview")}
            accountResource={{ data: profile, error: account?.error, retry: () => setProfileRefresh((value) => value + 1) }} />
        )}
      </main>
      <ErrorModal open={logoutOpen} title="Sair da conta?" message="Tem certeza que deseja encerrar sua sessão?" closeLabel="Cancelar" confirmLabel="Sair" onClose={() => setLogoutOpen(false)} onConfirm={logout} />
    </div>
  );
}

export default AdminHome;
