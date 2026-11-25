"use client";

const codeLength = 6;

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function VerificationCodeInput({ value, onChange, disabled }: Props) {
  return (
    <div className="relative mx-auto w-full max-w-[348px]">
      <input
        type="text"
        aria-label="Código de verificação de seis dígitos"
        autoComplete="one-time-code"
        inputMode="numeric"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, codeLength))}
        className="peer absolute inset-0 h-full w-full cursor-text opacity-0 disabled:cursor-default"
      />
      <div aria-hidden="true" className="pointer-events-none grid grid-cols-6 gap-2 rounded-md peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500 peer-focus-visible:ring-offset-2 peer-disabled:opacity-60 sm:gap-3">
        {Array.from({ length: codeLength }, (_, index) => (
          <span key={index} className="flex h-14 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-xl font-medium text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
            {value[index]}
          </span>
        ))}
      </div>
    </div>
  );
}
