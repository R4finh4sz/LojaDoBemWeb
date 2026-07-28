"use client";

import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput } from "@/components/ui/form-input";
import { inputMasks } from "@/utils/input-masks";
import { newAdminSchema, type NewAdminInput } from "@/validation/new-admin";
import { useGlobalModalStore } from "@/stores/useGlobalModalStore";
import { viaCepService } from "@/app/service/api/viaCepService";

const defaults: NewAdminInput = {
  nome: "", responsavel: "", cnpj: "", email: "", password: "", confirmPassword: "", cpf: "",
  dataNascimento: "", endereco: "", bairro: "", numero: "", complemento: "",
  cep: "", cidade: "", estado: "", telefone: "",
};

const fields: { name: keyof NewAdminInput; label: string; type?: string; placeholder?: string }[] = [
  { name: "nome", label: "Nome completo", placeholder: "Nome e sobrenome" },
  { name: "responsavel", label: "Responsável pelo login", placeholder: "Nome e sobrenome" },
  { name: "cnpj", label: "CNPJ vinculado", placeholder: "00.000.000/0000-00" },
  { name: "email", label: "E-mail", type: "email", placeholder: "nome@exemplo.com" },
  { name: "password", label: "Senha", type: "password", placeholder: "Mínimo de 8 caracteres" },
  { name: "confirmPassword", label: "Confirmar senha", type: "password" },
  { name: "cpf", label: "CPF", placeholder: "000.000.000-00" },
  { name: "dataNascimento", label: "Data de nascimento", placeholder: "DD/MM/AAAA" },
  { name: "cep", label: "CEP", placeholder: "00000-000" },
  { name: "endereco", label: "Endereço" },
  { name: "bairro", label: "Bairro" },
  { name: "numero", label: "Número" },
  { name: "complemento", label: "Complemento" },
  { name: "cidade", label: "Cidade" },
  { name: "estado", label: "Estado", placeholder: "SP" },
  { name: "telefone", label: "Telefone", placeholder: "(00) 00000-0000" },
];

const maskFor = (name: keyof NewAdminInput, value: string) => {
  if (name === "cpf") return inputMasks.cpf(value);
  if (name === "cnpj") return inputMasks.cnpj(value);
  if (name === "dataNascimento") return inputMasks.birthDate(value);
  if (name === "cep") return inputMasks.cep(value);
  if (name === "telefone") return inputMasks.phone(value);
  if (name === "estado") return value.replace(/[^a-z]/gi, "").slice(0, 2).toUpperCase();
  return value;
};

export const MasterNewAdminPage = () => {
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepResolved, setCepResolved] = useState(false);
  const showSuccess = useGlobalModalStore((state) => state.showSuccess);
  const { control, handleSubmit, setValue, setError, clearErrors, formState: { errors, isSubmitting } } = useForm<NewAdminInput>({
    resolver: zodResolver(newAdminSchema), mode: "onBlur", defaultValues: defaults,
  });

  const onSubmit = () => showSuccess("Cadastro validado e pronto para ser enviado ao backend.");

  const findCep = async (cep: string) => {
    if (cep.replace(/\D/g, "").length !== 8) {
      setCepResolved(false);
      return;
    }
    setLoadingCep(true);
    setCepResolved(false);
    clearErrors("cep");
    try {
      const address = await viaCepService.findAddress(cep);
      setValue("endereco", address.logradouro, { shouldValidate: true });
      setValue("bairro", address.bairro, { shouldValidate: true });
      setValue("cidade", address.localidade, { shouldValidate: true });
      setValue("estado", address.uf, { shouldValidate: true });
      setCepResolved(true);
    } catch (error) {
      setError("cep", { message: error instanceof Error ? error.message : "Erro ao consultar o CEP." });
    } finally {
      setLoadingCep(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.14)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Novo administrador</p>
        <h3 className="mt-2 text-3xl font-bold text-slate-900">Cadastro completo</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">Os formatos são aplicados durante a digitação e todos os dados são validados antes do envio.</p>
      </header>

      <section className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.14)] md:grid-cols-2">
        {fields.map(({ name, label, type = "text", placeholder }) => (
          <Controller key={name} name={name} control={control} render={({ field }) => (
            <FormInput {...field} value={field.value ?? ""} onChange={(event) => {
              field.onChange(maskFor(name, event.target.value));
              if (name === "cep") setCepResolved(false);
            }}
              onBlur={() => { field.onBlur(); if (name === "cep") void findCep(String(field.value)); }}
              disabled={["endereco", "bairro", "numero", "complemento", "cidade", "estado"].includes(name) && !cepResolved}
              id={name} label={name === "cep" && loadingCep ? "CEP · consultando..." : label} type={type} placeholder={placeholder ?? label} error={errors[name]} className="bg-white shadow-[0_5px_14px_rgba(15,23,42,0.08)]" />
          )} />
        ))}
        {!cepResolved && (
          <p className="-mt-2 text-sm text-slate-500 md:col-span-2">
            Informe um CEP válido para liberar os campos do endereço.
          </p>
        )}
      </section>

      <button type="submit" disabled={isSubmitting}
        className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(5,150,105,0.35)] transition hover:bg-emerald-700 disabled:opacity-60">
        Cadastrar administrador
      </button>
    </form>
  );
};

export default MasterNewAdminPage;
