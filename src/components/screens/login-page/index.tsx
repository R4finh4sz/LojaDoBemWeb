"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import logoImage from "@/assets/Images/LogoImage.png";
import { AuthHeader } from "@/components/ui/auth-header";
import { ActivityIndicator } from "@/components/ui/activity-indicator";
import { FormInput } from "@/components/ui/form-input";
import { loginSchema, type LoginInput } from "@/validation/login";
import { authService } from "@/app/service/api/authService";
import { useGlobalModalStore } from "@/stores/useGlobalModalStore";
import { CheckSquare, Square } from "lucide-react";
import {
  getRoleHomePath,
  isJwtValid,
  storeAuthSession,
} from "@/app/service/api/auth-session";

export const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [loginLocked, setLoginLocked] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isValid },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const router = useRouter();
  const showError = useGlobalModalStore((state) => state.showError);
  const remember =
    useWatch({ control, name: "rememberMe", defaultValue: false }) ?? false;

  const onSubmit = async (data: LoginInput) => {
    if (loginLocked) {
      showError(
        "Sua conta está temporariamente bloqueada devido a muitas tentativas falhas. Tente novamente em 15 minutos.",
      );
      return;
    }

    setLoading(true);
    try {
      const resp = await authService.login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe ?? false,
      });

      const jwt = resp?.data?.jwt;
      const roleId = resp?.data?.user?.role?.id;
      const userName =
        resp?.data?.user?.nome ??
        resp?.data?.user?.name ??
        resp?.data?.user?.username;
      const userEmail = resp?.data?.user?.email ?? data.email;

      if (jwt && isJwtValid(jwt)) {
        storeAuthSession({ jwt, roleId, userName, userEmail });
      }

      if (resp?.data?.requiresTwoFactor) {
        const challengeId = resp.data.challengeId;
        router.push(
          `/Auth/VerifyCode?email=${encodeURIComponent(data.email)}&challengeId=${encodeURIComponent(challengeId || "")}`,
        );
        return;
      }

      if (roleId === 4 || roleId === 5) {
        router.replace(getRoleHomePath(roleId));
      } else {
        showError("Acesso não autorizado para este usuário.");
      }
    } catch (err: unknown) {
      console.error(err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyErr = err as any;
      const backendMessage =
        anyErr?.response?.data?.message ||
        anyErr?.response?.data?.error ||
        anyErr?.message;

      const status = anyErr?.response?.status;
      if (status === 429) {
        setLoginLocked(true);
      }

      showError(
        backendMessage && typeof backendMessage === "string"
          ? backendMessage
          : "Credenciais inválidas.",
      );
    } finally {
      setLoading(false);
    }
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
                <button
                  type="button"
                  onClick={() =>
                    setValue("rememberMe", !remember, { shouldDirty: true })
                  }
                  className="mt-3 flex items-center gap-2 text-sm text-slate-600"
                >
                  {remember ? (
                    <CheckSquare className="text-emerald-600" size={20} />
                  ) : (
                    <Square className="text-slate-400" size={20} />
                  )}
                  <span>Lembrar-me</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || !isValid || loginLocked}
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

              {loginLocked && (
                <p className="text-center text-sm font-medium text-red-600">
                  Sua conta está temporariamente bloqueada devido a muitas
                  tentativas falhas. Tente novamente em 15 minutos.
                </p>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
