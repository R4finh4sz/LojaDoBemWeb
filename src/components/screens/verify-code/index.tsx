"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import verifiedImage from "@/assets/Images/Verified.png";
import { authService } from "@/app/service/api/authService";
import { useRouter } from "next/navigation";
import { useGlobalModalStore } from "@/stores/useGlobalModalStore";

interface Props {
  email: string;
  challengeId: string;
}

export const VerifyCode = ({ email, challengeId }: Props) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const showError = useGlobalModalStore((state) => state.showError);
  const hasFlowData = Boolean(email && challengeId);
  // codeInputs state: array of 6 chars
  const digits = 6;
  const [values, setValues] = useState<string[]>(Array(digits).fill(""));
  const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!hasFlowData) {
      router.replace("/Auth/Login");
    }
  }, [hasFlowData, router]);

  const onResend = async () => {
    setLoading(true);
    try {
      await authService.resendCode({ email, challengeId });
    } catch {
      showError("Erro ao reenviar código.");
    } finally {
      setLoading(false);
    }
  };

  // values -> joinedCode is derived when needed

  const handleChange = (index: number, val: string) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...values];
    next[index] = val;
    setValues(next);
    if (val && index < digits - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    const key = e.key;
    if (key === "Backspace" && !values[index] && index > 0) {
      const prev = [...values];
      prev[index - 1] = "";
      setValues(prev);
      inputsRef.current[index - 1]?.focus();
    } else if (key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (key === "ArrowRight" && index < digits - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("Text")
      .replace(/\D/g, "")
      .slice(0, digits);
    const next = Array(digits).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setValues(next);
    const focusIndex = Math.min(pasted.length, digits - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  const joinedCode = values.join("");

  if (!hasFlowData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 text-slate-800">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-emerald-600">
            Acesso restrito
          </p>
          <p className="mt-3 text-lg text-slate-600">
            Redirecionando para o login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow">
        <h2 className="mb-2 text-center text-2xl font-semibold text-slate-600">
          Verificação de código
        </h2>
        <p className="mb-4 text-center text-sm text-slate-600">
          Enviamos um código para o e-mail <strong>{email}</strong>
        </p>

        <div className="flex items-center justify-center gap-3">
          {Array.from({ length: digits }).map((_, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              value={values[i]}
              onChange={(e) =>
                handleChange(i, e.target.value.replace(/\D/g, "").slice(-1))
              }
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={handlePaste}
              inputMode="numeric"
              pattern="[0-9]*"
              className="h-14 w-12 rounded-md border border-slate-200 bg-slate-50 text-center text-xl font-medium text-slate-800 outline-none focus:border-emerald-400 focus:bg-white"
            />
          ))}
        </div>
        <div className="mb-6 flex items-center justify-center">
          <Image
            src={verifiedImage}
            alt="Verified"
            width={260}
            height={260}
            className="object-contain"
          />
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onResend}
            disabled={loading}
            className="flex-1 rounded-lg border border-slate-200 py-3 text-sm font-medium text-slate-600"
          >
            Reenviar código
          </button>

          <button
            onClick={() => {
              (async () => {
                setLoading(true);
                try {
                  const resp = await authService.verifyCode({
                    email,
                    code: joinedCode,
                    challengeId,
                  });
                  const accessToken = resp?.data?.accessToken;
                  const roleId = resp?.data?.user?.role?.id;
                  if (accessToken) {
                    try {
                      localStorage.setItem("accessToken", accessToken);
                    } catch {
                      // ignore
                    }
                  }
                  if (roleId === 4) router.push("/Admin");
                  else if (roleId === 5) router.push("/Master");
                  else showError("Acesso não autorizado para este usuário.");
                } catch {
                  showError("Código inválido ou expirado.");
                } finally {
                  setLoading(false);
                }
              })();
            }}
            disabled={loading || joinedCode.length !== digits}
            className="flex-1 rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white"
          >
            {loading ? "Verificando..." : "Verificar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;
