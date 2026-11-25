import AuthGuard from "@/components/ui/auth-guard";
import CooperativeHome from "@/components/screens/cooperative";

export const metadata = { title: "Cooperativa - ReciclaOnline" };

export default async function CooperativePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  return (
    <AuthGuard title="Painel da Cooperativa" allowedRoles="COOPERATIVA">
      <CooperativeHome openProfile={(await searchParams).tab === "profile"} />
    </AuthGuard>
  );
}
