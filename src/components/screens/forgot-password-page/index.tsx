"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import logoImage from "@/assets/Images/LogoImage.png";
import { AuthHeader } from "@/components/ui/auth-header";
import { ActivityIndicator } from "@/components/ui/activity-indicator";
import { FormInput } from "@/components/ui/form-input";
import {
  forgotPasswordEmailSchema,
  forgotPasswordCodeSchema,
  forgotPasswordResetSchema,
  type ForgotPasswordEmailInput,
  type ForgotPasswordCodeInput,
  type ForgotPasswordResetInput,
} from "@/validation/forgot-password";

type Step = 1 | 2 | 3;

export const ForgotPasswordPage = () => {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const emailForm = useForm<ForgotPasswordEmailInput>({
    resolver: zodResolver(forgotPasswordEmailSchema),
    mode: "onChange",
  });

  const codeForm = useForm<ForgotPasswordCodeInput>({
    resolver: zodResolver(forgotPasswordCodeSchema),
    mode: "onChange",
  });

  const passwordForm = useForm<ForgotPasswordResetInput>({
    resolver: zodResolver(forgotPasswordResetSchema),
    mode: "onChange",
  });

  const handleStep1Submit = async (data: ForgotPasswordEmailInput) => {
    setLoading(true);

    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);

    setSuccessMessage("Código enviado para seu e-mail");
    setTimeout(() => setStep(2), 1500);
  };

  const handleStep2Submit = async (data: ForgotPasswordCodeInput) => {
    setLoading(true);
    setSuccessMessage("");

    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);

    setTimeout(() => setStep(3), 1500);
  };

  const handleStep3Submit = async (data: ForgotPasswordResetInput) => {
    setLoading(true);

    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);

    setSuccessMessage("Senha alterada com sucesso! Redirecionando...");
    setTimeout(() => {
      window.location.href = "/Auth/Login";
    }, 2000);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
      setSuccessMessage("");
    }
  };

  const stepTitles = {
    1: "Recupere sua senha",
    2: "Verifique o código",
    3: "Defina uma nova senha",
  };

  const stepDescriptions = {
    1: "Insira seu e-mail para receber um código de verificação",
    2: "Digite o código de 6 dígitos enviado para seu e-mail",
    3: "Crie uma nova senha segura para sua conta",
  };

  useEffect(() => {
    if (successMessage && step === 1) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, step]);

  useEffect(() => {
    setSuccessMessage("");
  }, [step]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7fbf8] text-slate-900 dark:bg-[#07100b] dark:text-slate-100 flex flex-col">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.18),transparent_35%),radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.12),transparent_28%)] dark:bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.10),transparent_38%)]" />
      <AuthHeader
        logo={logoImage}
        backHref="/Auth/Login"
        backLabel="Voltar ao login"
      />

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          <div className="rounded-3xl bg-white px-12 py-14 shadow-2xl shadow-emerald-600/20 ring-1 ring-emerald-100/80 dark:bg-slate-900 dark:ring-slate-700">
            <div className="mb-8 flex items-center justify-center">
              <div className="flex items-center gap-0 max-w-sm">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center flex-1">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-full font-bold text-lg transition shrink-0 ${
                        s === step
                          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/40"
                          : s < step
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500 opacity-40"
                      }`}
                    >
                      {s < step ? (
                        <svg
                          className="h-6 w-6"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        s
                      )}
                    </div>
                    {s < 3 && (
                      <div
                        className={`h-1.5 flex-1 mx-2 transition ${
                          s < step ? "bg-emerald-600" : "bg-slate-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8 flex flex-col items-center text-center">
              <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-800">
                {stepTitles[step]}
              </h1>
              <p className="text-base text-slate-500 max-w-sm">
                {stepDescriptions[step]}
              </p>
            </div>

            {successMessage && (
              <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-200">
                <svg
                  className="h-5 w-5 text-emerald-600 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm font-medium text-emerald-800">
                  {successMessage}
                </p>
              </div>
            )}

            <div className="space-y-5">
              {step === 1 && (
                <form onSubmit={emailForm.handleSubmit(handleStep1Submit)}>
                  <FormInput
                    {...emailForm.register("email")}
                    id="email"
                    type="email"
                    label="E-mail"
                    placeholder="voce@exemplo.com"
                    error={emailForm.formState.errors.email}
                  />
                  <button
                    type="submit"
                    disabled={loading || !emailForm.formState.isValid}
                    className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/30 transition hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/40 active:scale-[0.98] disabled:opacity-60"
                  >
                    {loading ? (
                      <ActivityIndicator
                        size="md"
                        color="white"
                        label="Processando..."
                      />
                    ) : (
                      "Próximo"
                    )}
                  </button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={codeForm.handleSubmit(handleStep2Submit)}>
                  <FormInput
                    {...codeForm.register("code")}
                    id="code"
                    type="text"
                    label="Código de Verificação"
                    placeholder="000000"
                    maxLength={6}
                    error={codeForm.formState.errors.code}
                    className="text-center text-2xl tracking-widest"
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);
                      codeForm.setValue("code", value, {
                        shouldValidate: true,
                      });
                    }}
                  />
                  <p className="mt-3 text-center text-xs text-slate-500">
                    Não recebeu o código?{" "}
                    <button
                      type="button"
                      className="font-medium text-emerald-600 transition hover:text-emerald-800"
                    >
                      Reenviar
                    </button>
                  </p>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={loading}
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98] disabled:opacity-60"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !codeForm.formState.isValid}
                      className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/30 transition hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/40 active:scale-[0.98] disabled:opacity-60"
                    >
                      {loading ? (
                        <ActivityIndicator
                          size="md"
                          color="white"
                          label="Processando..."
                        />
                      ) : (
                        "Próximo"
                      )}
                    </button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={passwordForm.handleSubmit(handleStep3Submit)}>
                  <FormInput
                    {...passwordForm.register("password")}
                    id="password"
                    type="password"
                    label="Nova Senha"
                    placeholder="••••••••"
                    error={passwordForm.formState.errors.password}
                  />

                  <FormInput
                    {...passwordForm.register("confirmPassword")}
                    id="confirmPassword"
                    type="password"
                    label="Confirmar Senha"
                    placeholder="••••••••"
                    error={passwordForm.formState.errors.confirmPassword}
                  />

                  <div className="text-xs text-slate-600">
                    A senha deve conter:
                    <ul className="mt-2 space-y-1">
                      <li
                        className={`${passwordForm.watch("password")?.length >= 8 ? "text-emerald-700" : "text-slate-500"}`}
                      >
                        • No mínimo 8 caracteres
                      </li>
                      <li
                        className={`${/[a-z]/.test(passwordForm.watch("password") || "") ? "text-emerald-700" : "text-slate-500"}`}
                      >
                        • Letras minúsculas
                      </li>
                      <li
                        className={`${/[A-Z]/.test(passwordForm.watch("password") || "") ? "text-emerald-700" : "text-slate-500"}`}
                      >
                        • Letras maiúsculas
                      </li>
                      <li
                        className={`${/\d/.test(passwordForm.watch("password") || "") ? "text-emerald-700" : "text-slate-500"}`}
                      >
                        • Números
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={loading}
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98] disabled:opacity-60"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !passwordForm.formState.isValid}
                      className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/30 transition hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/40 active:scale-[0.98] disabled:opacity-60"
                    >
                      {loading ? (
                        <ActivityIndicator
                          size="md"
                          color="white"
                          label="Processando..."
                        />
                      ) : (
                        "Alterar Senha"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="mt-6 border-t border-slate-100 pt-6 text-center">
              <p className="text-sm text-slate-500">
                Lembrou sua senha?{" "}
                <a
                  href="/Auth/Login"
                  className="font-medium text-emerald-600 transition hover:text-emerald-800"
                >
                  Volte ao login
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
