"use client";

import Image, { type StaticImageData } from "next/image";
import { BackLink } from "@/components/ui/back-link";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface AuthHeaderProps {
  logo: StaticImageData;
  backHref?: string;
  backLabel?: string;
}

export const AuthHeader = ({
  logo,
  backHref = "/",
  backLabel = "Voltar ao início",
}: AuthHeaderProps) => {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-8 sm:px-10 lg:px-12">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-emerald-600/25 ring-1 ring-emerald-100">
          <Image
            src={logo}
            alt="Logo do ReciclaOnline"
            width={64}
            height={64}
            className="h-full w-full object-cover"
            priority
            unoptimized
          />
        </div>
        <div>
          <p className="text-lg font-semibold uppercase  text-emerald-700">
            ReciclaOnline
          </p>
          <p className="text-base font-normal text-slate-600">
            Troca de recicláveis por ecocoins
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <BackLink href={backHref} label={backLabel} />
      </div>
    </header>
  );
};
