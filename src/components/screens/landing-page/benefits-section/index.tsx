import { SectionKicker } from "@/components/ui/section-kicker/index";

type BenefitCard = {
  kicker: string;
  title: string;
  description: string;
  tone: "default" | "accent";
};

type BenefitsSectionProps = {
  id: string;
  cards: BenefitCard[];
};

export function BenefitsSection({ id, cards }: BenefitsSectionProps) {
  return (
    <section
      id={id}
      className="mx-auto w-full max-w-7xl px-6 pb-20 sm:px-10 lg:px-12"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.kicker}
            className={
              card.tone === "accent"
                ? "rounded-4xl border border-emerald-500 bg-emerald-600 p-7 text-white shadow-[0_18px_60px_-40px_rgba(22,163,74,0.8)] dark:border-emerald-700 dark:bg-emerald-800"
                : "rounded-4xl border border-emerald-100 bg-white p-7 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.45)] dark:border-slate-700 dark:bg-slate-900"
            }
          >
            <SectionKicker>{card.kicker}</SectionKicker>
            <h3
              className={
                card.tone === "accent"
                  ? "mt-5 text-2xl font-medium"
                  : "mt-5 text-2xl font-medium text-emerald-950 dark:text-emerald-50"
              }
            >
              {card.title}
            </h3>
            <p
              className={
                card.tone === "accent"
                  ? "mt-3 leading-7 font-normal text-emerald-50/90"
                  : "mt-3 leading-7 font-normal text-slate-600"
              }
            >
              {card.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
