type SectionKickerProps = {
  children: React.ReactNode;
};

export function SectionKicker({ children }: SectionKickerProps) {
  return (
    <span className="inline-flex items-center rounded-full border border-emerald-200 bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 shadow-sm backdrop-blur-sm">
      {children}
    </span>
  );
}
