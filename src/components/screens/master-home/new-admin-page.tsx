"use client";

import { useState } from "react";
import { useGlobalModalStore } from "@/stores/useGlobalModalStore";

const initialForm = {
  nome: "Joao Silva",
  email: "spgustavorisio@gmail.com",
  password: "SenhaForte@123",
  confirmPassword: "SenhaForte@123",
  cpf: "44823456874",
  dataNascimento: "1990-01-15",
  endereco: "Rua A",
  numero: "123",
  complemento: "Apto 10",
  imagemUrl: "https://exemplo.com/imagem.jpg",
  cep: "12345-678",
  cidade: "Sao Paulo",
  estado: "SP",
  telefone: "11999999999",
};

export const MasterNewAdminPage = () => {
  const [form, setForm] = useState(initialForm);
  const showError = useGlobalModalStore((state) => state.showError);

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      showError("As senhas não conferem.");
      return;
    }

    showError(
      "Cadastro preparado para integração com o endpoint de criação de administrador.",
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-4xl border border-emerald-100 bg-white/95 p-6 shadow-[0_18px_50px_rgba(16,185,129,0.07)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">
          Novo administrador
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-slate-900">
          Cadastro completo
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Preencha os dados abaixo com o formato solicitado para cadastrar um
          novo administrador.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["nome", "Nome completo"],
          ["email", "E-mail"],
          ["password", "Senha"],
          ["confirmPassword", "Confirmar senha"],
          ["cpf", "CPF"],
          ["dataNascimento", "Data de nascimento"],
          ["endereco", "Endereço"],
          ["numero", "Número"],
          ["complemento", "Complemento"],
          ["imagemUrl", "Imagem URL"],
          ["cep", "CEP"],
          ["cidade", "Cidade"],
          ["estado", "Estado"],
          ["telefone", "Telefone"],
        ].map(([field, label]) => (
          <label
            key={field}
            className="block rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              {label}
            </span>
            <input
              value={form[field as keyof typeof initialForm]}
              onChange={(event) =>
                updateField(
                  field as keyof typeof initialForm,
                  event.target.value,
                )
              }
              type={
                field === "password" || field === "confirmPassword"
                  ? "password"
                  : "text"
              }
              className="mt-3 w-full rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
              placeholder={label}
            />
          </label>
        ))}
      </div>

      <button
        type="submit"
        className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700"
      >
        Cadastrar administrador
      </button>
    </form>
  );
};

export default MasterNewAdminPage;
