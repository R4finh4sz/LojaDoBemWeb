"use client";

import Image from "next/image";
import { useState } from "react";

import logoImage from "@/assets/Images/LogoImage.png";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50 flex flex-col">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 sm:px-10 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-emerald-600/25 ring-1 ring-emerald-100">
            <Image
              src={logoImage}
              alt="Logo do ReciclaOnline"
              width={44}
              height={44}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
              ReciclaOnline
            </p>
            <p className="text-sm font-normal text-slate-600">
              Troca de recicláveis por ecocoins
            </p>
          </div>
        </div>
        <a
          href="/"
          className="text-sm font-medium text-slate-600 transition hover:text-emerald-800"
        >
          ← Voltar ao início
        </a>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          
          <div className="rounded-3xl bg-white px-8 py-10 shadow-xl shadow-emerald-600/10 ring-1 ring-emerald-100/60">
            
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-emerald-600/25 ring-1 ring-emerald-100">
                <Image
                  src={logoImage}
                  alt="Logo do ReciclaOnline"
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              </div>
              <h1 className="text-2xl mb-4 font-bold tracking-tight text-slate-800">
                Bem-vindo de volta
              </h1>
              <p className="text-sm text-slate-500">
                Entre na sua conta para continuar gerindo o ReciclaOnline e fomentar a reciclagem na sua cidade.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@exemplo.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-400/20"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-700"
                  >
                    Senha
                  </label>
                  <a
                    href="/forgot-password"
                    className="text-xs font-medium text-emerald-600 transition hover:text-emerald-800"
                  >
                    Esqueceu a senha?
                  </a>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-400/20"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-2 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/30 transition hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/40 active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                      />
                    </svg>
                    Entrando...
                  </span>
                ) : (
                  "Entrar"
                )}
              </button>
            </div>

          

          </div>

         
        </div>
      </main>
    </div>
  );
}
