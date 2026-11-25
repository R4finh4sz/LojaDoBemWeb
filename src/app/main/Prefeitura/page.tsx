import AdminHome from "@/components/screens/admin/home";

export const metadata = {
  title: "Prefeitura - ReciclaOnline",
};

export default async function PrefeituraPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  return <AdminHome openProfile={(await searchParams).tab === "profile"} />;
}
