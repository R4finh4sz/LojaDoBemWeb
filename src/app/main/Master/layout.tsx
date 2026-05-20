import MasterShell from "@/components/screens/master-home/master-shell";

export default function MasterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MasterShell>{children}</MasterShell>;
}
