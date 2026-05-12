import Image, { type StaticImageData } from "next/image";

type Reward = {
  name: string;
  note: string;
  points: string;
};

type PlatformPreviewProps = {
  logo: StaticImageData;
  title: string;
  subtitle: string;
  cityRules: string[];
  rewards: Reward[];
};

export function PlatformPreview({
  logo,
  title,
  subtitle,
  cityRules,
  rewards,
}: PlatformPreviewProps) {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute -left-4 top-6 h-28 w-28 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="absolute -right-2 top-28 h-36 w-36 rounded-full bg-lime-400/20 blur-3xl" />

      <div className="relative overflow-hidden rounded-4xl border border-emerald-100 bg-white/90 p-5 shadow-[0_30px_80px_-32px_rgba(15,23,42,0.45)] backdrop-blur">
        <div className="flex items-center gap-4 rounded-3xl bg-emerald-600 px-5 py-4 text-white">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white/15 ring-1 ring-white/20">
            <Image
              src={logo}
              alt="Logo do ReciclaOnline"
              width={56}
              height={56}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-100">
              {title}
            </p>
            <p className="mt-1 text-xl font-semibold">{subtitle}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_0.95fr]">
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
            <p className="text-sm font-semibold text-emerald-800">
              Configuração por cidade
            </p>
            <div className="mt-4 space-y-3">
              {cityRules.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-white p-5">
            <p className="text-sm font-semibold text-emerald-800">
              Troca orientada por ecocoins
            </p>
            <div className="mt-4 space-y-3">
              {rewards.map((reward) => (
                <div
                  key={reward.name}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-slate-900">{reward.name}</p>
                    <p className="text-sm text-slate-500">{reward.note}</p>
                  </div>
                  <p className="text-lg font-black text-emerald-700">
                    {reward.points}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
