import MasterShell from "@/components/screens/master/shell";
import AuthGuard from "@/components/ui/auth-guard";

export default function MasterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard title="Painel Master" allowedRoles="MASTER">
      <MasterShell>{children}</MasterShell>
    </AuthGuard>
  );
}
