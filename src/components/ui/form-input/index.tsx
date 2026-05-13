import { InputHTMLAttributes } from "react";
import { FieldError } from "react-hook-form";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: FieldError;
  helpText?: string;
}

export const FormInput = ({
  label,
  error,
  helpText,
  className,
  ...props
}: FormInputProps) => {
  return (
    <div>
      {label && (
        <label
          htmlFor={props.id}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}
      <input
        {...props}
        className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition ${
          error
            ? "border-red-400 bg-red-50 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-400/20"
            : "border-slate-200 bg-slate-50 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-400/20"
        } ${className || ""}`}
      />
      {error && <p className="mt-1.5 text-xs text-red-600">{error.message}</p>}
      {helpText && !error && (
        <p className="mt-1.5 text-xs text-slate-500">{helpText}</p>
      )}
    </div>
  );
};
