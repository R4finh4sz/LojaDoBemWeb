import AuthGuard from "@/components/ui/auth-guard";
import CooperativeHome from "@/components/screens/cooperative";

export const metadata = { title: "Cooperativa - ReciclaOnline" };

export default function CooperativePage() {
  return (
    <AuthGuard title="Painel da Cooperativa" allowedRoles="COOPERATIVA">
      <CooperativeHome />
    </AuthGuard>
  );
}
