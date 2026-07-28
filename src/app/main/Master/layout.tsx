import MasterShell from "@/components/screens/master-home/master-shell";
import AuthGuard from "@/components/ui/auth-guard";

export default function MasterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard title="Painel Master" allowedRoles={4}>
      <MasterShell>{children}</MasterShell>
    </AuthGuard>
  );
}
