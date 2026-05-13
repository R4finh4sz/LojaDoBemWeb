import { ArrowLeft, LucideIcon } from "lucide-react";
import Link from "next/link";

interface BackLinkProps {
  href: string;
  label?: string;
  icon?: LucideIcon;
}

export const BackLink = ({
  href,
  label = "Voltar",
  icon: Icon = ArrowLeft,
}: BackLinkProps) => {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 text-lg font-medium text-slate-600 transition hover:text-emerald-800"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
};
