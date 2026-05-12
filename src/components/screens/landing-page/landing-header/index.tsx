import Image, { type StaticImageData } from "next/image";

import { ButtonLink } from "@/components/ui/button-link/index";

type NavItem = {
  label: string;
  href: string;
};

type LandingHeaderProps = {
  logo: StaticImageData;
  navItems: NavItem[];
};

export function LandingHeader({ logo, navItems }: LandingHeaderProps) {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 sm:px-10 lg:px-12">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-emerald-600/25 ring-1 ring-emerald-100">
          <Image
            src={logo}
            alt="Logo do ReciclaOnline"
            width={44}
            height={44}
            className="h-full w-full object-cover"
            priority
          />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
            ReciclaOnline
          </p>
          <p className="text-sm font-normal text-slate-600">
            Troca de recicláveis por ecocoins
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              className="transition hover:text-emerald-800"
              href={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <ButtonLink href="/Auth/Login" variant="secondary" className="px-4 py-2.5">
          Login
        </ButtonLink>
      </div>
    </header>
  );
}
