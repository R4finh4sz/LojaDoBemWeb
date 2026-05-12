import { ButtonLink } from "@/components/ui/button-link/index";
import { SectionKicker } from "@/components/ui/section-kicker/index";

type HeroStat = {
  value: string;
  label: string;
};

type HeroSectionProps = {
  kicker: string;
  title: string;
  description: string;
  primaryAction: {
    href: string;
    label: string;
  };
  secondaryAction: {
    href: string;
    label: string;
  };
  stats: HeroStat[];
  centered?: boolean;
};

export function HeroSection({
  kicker,
  title,
  description,
  primaryAction,
  secondaryAction,
  stats,
  centered = false,
}: HeroSectionProps) {
  return (
    <div
      className={`flex flex-col justify-center ${
        centered ? "items-center text-center" : ""
      }`}
    >
      <SectionKicker>{kicker}</SectionKicker>

      <h1
        className={`mt-6 font-bold tracking-tight text-emerald-950 ${
          centered
            ? "max-w-4xl text-5xl sm:text-6xl lg:text-7xl"
            : "max-w-3xl text-4xl sm:text-5xl lg:text-6xl"
        }`}
      >
        {title}
      </h1>

      <p
        className={`mt-6 text-lg leading-8 font-normal text-slate-600 sm:text-xl ${
          centered ? "max-w-3xl" : "max-w-2xl"
        }`}
      >
        {description}
      </p>

      <div
        className={`mt-8 flex flex-col gap-3 sm:flex-row ${
          centered ? "sm:justify-center" : ""
        }`}
      >
        <ButtonLink href={primaryAction.href} className="min-w-48">
          {primaryAction.label}
        </ButtonLink>
        <ButtonLink
          href={secondaryAction.href}
          variant="ghost"
          className="min-w-48"
        >
          {secondaryAction.label}
        </ButtonLink>
      </div>

      <div className="mt-10 grid w-full gap-4 sm:grid-cols-3">
        {stats.map((item) => (
          <article
            key={item.label}
            className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur"
          >
            <p className="text-2xl font-medium text-emerald-700">
              {item.value}
            </p>
            <p className="mt-2 text-sm leading-6 font-normal text-slate-600">
              {item.label}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
