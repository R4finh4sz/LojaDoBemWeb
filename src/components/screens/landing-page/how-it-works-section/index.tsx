import { SectionKicker } from "@/components/ui/section-kicker/index";

type Step = {
  title: string;
  description: string;
};

type HowItWorksSectionProps = {
  id: string;
  kicker: string;
  title: string;
  description: string;
  steps: Step[];
};

export function HowItWorksSection({
  id,
  kicker,
  title,
  description,
  steps,
}: HowItWorksSectionProps) {
  return (
    <section
      id={id}
      className="mx-auto w-full max-w-7xl px-6 pb-20 sm:px-10 lg:px-12"
    >
      <div className="grid gap-6 rounded-4xl border border-emerald-100 bg-white/80 p-8 shadow-[0_20px_70px_-45px_rgba(15,23,42,0.4)] backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 lg:grid-cols-[0.85fr_1.15fr] lg:p-10">
        <div>
          <SectionKicker>{kicker}</SectionKicker>
          <h2 className="mt-5 text-3xl font-bold text-emerald-950 dark:text-emerald-50 sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-base leading-7 font-normal text-slate-600">
            {description}
          </p>
        </div>

        <div className="grid gap-4">
          {steps.map((step) => (
            <article
              key={step.title}
              className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5 dark:border-slate-700 dark:bg-slate-800"
            >
              <h3 className="text-lg font-medium text-emerald-950 dark:text-emerald-100">
                {step.title}
              </h3>
              <p className="mt-2 leading-7 font-normal text-slate-600">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
