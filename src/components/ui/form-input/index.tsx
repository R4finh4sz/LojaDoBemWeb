import { useId, useState, type InputHTMLAttributes } from "react";
import { FieldError } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

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
  const generatedId = useId();
  const id = props.id ?? generatedId;
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = props.type === "password";
  const inputType = isPasswordField && showPassword ? "text" : props.type;

  return (
    <div className="relative">
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          {...props}
          id={id}
          type={inputType}
          className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition ${
            error
              ? "border-red-400 bg-red-50 focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-400/20 dark:bg-red-950/45 dark:focus:bg-red-950/60"
              : "border-slate-200 bg-slate-50 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-400/20 dark:focus:bg-slate-800"
          } ${isPasswordField ? "pr-14" : ""} dark:[color-scheme:dark] disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:opacity-45 disabled:shadow-none ${className || ""}`}
        />
        {isPasswordField ? (
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            className={`absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition ${
              showPassword
                ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800"
                : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        ) : null}
      </div>
      {error && (
        <p className="mt-1.5 mb-3 text-xs text-red-600 dark:text-red-300">{error.message}</p>
      )}
      {helpText && !error && (
        <p className="mt-1.5 mb-3 text-xs text-slate-500">{helpText}</p>
      )}
    </div>
  );
};
