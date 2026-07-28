import Link from "next/link";

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

const variantClasses = {
  primary:
    "bg-emerald-600 text-white shadow-[0_18px_45px_-22px_rgba(22,163,74,0.8)] hover:bg-emerald-500",
  secondary:
    "border border-emerald-200 bg-white/90 text-emerald-900 hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-900 dark:text-emerald-200 dark:hover:bg-slate-800",
  ghost: "text-emerald-950 hover:bg-emerald-950/5 hover:text-emerald-800 dark:text-emerald-200 dark:hover:bg-white/5 dark:hover:text-emerald-100",
} as const;

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-200 ${variantClasses[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
