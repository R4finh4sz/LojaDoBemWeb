import AuthGuard from "@/components/ui/auth-guard";
import { TermsReader } from "@/components/screens/shared/terms-reader";

export const metadata = { title: "Termos de uso - ReciclaOnline" };

export default function TermsPage() {
  return (
    <AuthGuard allowedRoles={["MASTER", "PrefeituraVendedor", "COOPERATIVA"]}>
      <TermsReader />
    </AuthGuard>
  );
}
