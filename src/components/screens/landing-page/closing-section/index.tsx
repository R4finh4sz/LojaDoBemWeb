import { ButtonLink } from "@/components/ui/button-link/index";
import { SectionKicker } from "@/components/ui/section-kicker/index";

type ClosingSectionProps = {
  id: string;
  kicker: string;
  title: string;
  description: string;
  bullets: string[];
};

export function ClosingSection({
  id,
  kicker,
  title,
  description,
  bullets,
}: ClosingSectionProps) {
  return (
    <section
      id={id}
      className="mx-auto w-full max-w-7xl px-6 pb-24 sm:px-10 lg:px-12"
    >
      <div className="rounded-4xl bg-emerald-950 px-8 py-10 text-white shadow-[0_24px_80px_-36px_rgba(6,95,70,0.85)] lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <SectionKicker>{kicker}</SectionKicker>
            <h2 className="mt-5 text-3xl font-bold sm:text-4xl">{title}</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 font-normal text-emerald-50/85">
              {description}
            </p>
            <div className="mt-6">
              <ButtonLink
                href="/login"
                variant="secondary"
                className="px-4 py-2.5"
              >
                Login de admin
              </ButtonLink>
            </div>
          </div>

          <div className="grid gap-3 rounded-[1.75rem] bg-white/8 p-4 backdrop-blur">
            {bullets.map((item) => (
              <div
                key={item}
                className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium text-emerald-50"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
