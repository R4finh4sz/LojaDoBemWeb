"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { CheckSquare, Square } from "lucide-react";

import logoImage from "@/assets/Images/LogoImage.png";
import { getRoleHomePath, getTokenRole, isJwtValid, storeAuthSession } from "@/app/service/api/auth-session";
import { authService } from "@/app/service/api/authService";
import { demoAccounts, demoEnabled, demoPassword } from "@/app/service/api/demo-config";
import { apiError } from "@/app/service/api/http";
import { AuthHeader } from "@/components/ui/auth-header";
import { ActivityIndicator } from "@/components/ui/activity-indicator";
import { FormInput } from "@/components/ui/form-input";
import { useGlobalModalStore } from "@/stores/useGlobalModalStore";
import { loginSchema, type LoginInput } from "@/validation/login";

export const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const showError = useGlobalModalStore((state) => state.showError);
  const { register, handleSubmit, setValue, control, formState: { errors, isValid } } =
    useForm<LoginInput>({ resolver: zodResolver(loginSchema), mode: "onChange" });
  const remember = useWatch({ control, name: "rememberMe", defaultValue: false }) ?? false;

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      const result = await authService.login({ email: data.email, password: data.password });
      sessionStorage.removeItem("loginChallenge");
      sessionStorage.removeItem("firstLoginToken");
      if (result.twoFactorRequired === false) {
        const role = getTokenRole(result.token);
        if (!role || !isJwtValid(result.token)) {
          showError("O perfil desta conta não tem acesso ao painel web ou a sessão é inválida.");
          return;
        }
        storeAuthSession(result.token, data.email, remember);
        router.replace(getRoleHomePath(role));
        return;
      }
      if (!result.challengeId) {
        showError("Não foi possível iniciar a verificação em duas etapas.");
        return;
      }
      sessionStorage.setItem("loginChallenge", JSON.stringify({ challengeId: result.challengeId, email: data.email, remember }));
      router.push("/Auth/VerifyCode");
    } catch (error) {
      showError(apiError(error, "Não foi possível entrar."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#f7fbf8] text-slate-900 dark:bg-[#07100b] dark:text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.22),transparent_38%),linear-gradient(180deg,#f0fdf4_0%,#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.10),transparent_38%)]" />
      <AuthHeader logo={logoImage} backHref="/" backLabel="Voltar ao início" />
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg rounded-3xl bg-white px-8 py-10 shadow-[0_24px_70px_rgba(15,23,42,0.20)] ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700 sm:px-12 sm:py-12">
          <div className="mb-7 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Seja Bem-vindo</h1>
            <p className="mx-auto mt-3 max-w-sm text-base leading-7 text-slate-600">
              Insira suas credenciais para acessar o painel administrativo do sistema de gestão de resíduos sólidos.
            </p>
          </div>

          {demoEnabled && (
            <section className="mb-7 rounded-xl bg-emerald-50 p-4 dark:bg-slate-800">
              <p className="mb-3 text-sm font-semibold text-emerald-800 dark:text-emerald-300">Demonstração · escolha um perfil</p>
              <div className="flex flex-wrap gap-2">
                {demoAccounts.map(({ label, email }) => (
                  <button key={email} type="button" onClick={() => {
                    setValue("email", email, { shouldValidate: true });
                    setValue("password", demoPassword, { shouldValidate: true });
                  }} className="rounded-lg border border-emerald-300 px-3 py-2 text-sm font-semibold">
                    {label}
                  </button>
                ))}
              </div>
            </section>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FormInput {...register("email")} id="email" type="email" label="E-mail" placeholder="voce@exemplo.com" error={errors.email} />
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">Senha</label>
                <a href="/Auth/ForgotPassword" className="text-xs font-medium text-emerald-700 hover:text-emerald-900">Esqueceu a senha?</a>
              </div>
              <FormInput {...register("password")} id="password" type="password" placeholder="••••••••" error={errors.password} />
              <button type="button" onClick={() => setValue("rememberMe", !remember, { shouldDirty: true })}
                className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                {remember ? <CheckSquare className="text-emerald-600" size={20} /> : <Square className="text-slate-400" size={20} />}
                <span>Lembrar-me</span>
              </button>
            </div>
            <button type="submit" disabled={loading || !isValid}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(5,150,105,0.35)] transition hover:bg-emerald-700 hover:shadow-[0_14px_30px_rgba(5,150,105,0.42)] active:scale-[0.98] disabled:opacity-60">
              {loading ? <ActivityIndicator size="md" color="white" label="Entrando..." /> : "Entrar"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
