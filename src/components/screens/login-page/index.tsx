"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import logoImage from "@/assets/Images/LogoImage.png";
import { AuthHeader } from "@/components/ui/auth-header";
import { ActivityIndicator } from "@/components/ui/activity-indicator";
import { FormInput } from "@/components/ui/form-input";
import { loginSchema, type LoginInput } from "@/validation/login";

export const LoginPage = () => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-900 flex flex-col">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.18),transparent_35%),radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(6,95,70,0.12),transparent_22%)]" />
      <AuthHeader logo={logoImage} backHref="/" backLabel="Voltar ao início" />

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          <div className="rounded-3xl bg-white px-12 py-14 shadow-2xl shadow-emerald-600/20 ring-1 ring-emerald-100/80\">
            <div className="mb-8 flex flex-col items-center justify-center text-center">
              <h1 className="text-3xl mb-6 font-bold tracking-tight text-slate-800">
                Bem-vindo de volta
              </h1>
              <p className="text-lg text-slate-500 max-w-xs">
                Entre na sua conta para continuar gerindo o ReciclaOnline e
                fomentar a reciclagem na sua cidade.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <FormInput
                {...register("email")}
                id="email"
                type="email"
                label="E-mail"
                placeholder="voce@exemplo.com"
                error={errors.email}
              />

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-700"
                  >
                    Senha
                  </label>
                  <a
                    href="/Auth/ForgotPassword"
                    className="text-xs font-medium text-emerald-600 transition hover:text-emerald-800"
                  >
                    Esqueceu a senha?
                  </a>
                </div>
                <FormInput
                  {...register("password")}
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !isValid}
                className="mt-2 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/30 transition hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/40 active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? (
                  <ActivityIndicator
                    size="md"
                    color="white"
                    label="Entrando..."
                  />
                ) : (
                  "Entrar"
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
