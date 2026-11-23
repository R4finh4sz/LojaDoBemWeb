"use client";

import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput } from "@/components/ui/form-input";
import { inputMasks } from "@/utils/input-masks";
import { operatorSchema, type NewAdminInput } from "@/validation/new-admin";
import { useGlobalModalStore } from "@/stores/useGlobalModalStore";
import { apiError, http } from "@/app/service/api/http";
import { viaCepService } from "@/app/service/api/viaCepService";

const defaults: NewAdminInput = {
  nome: "", cnpj: "", email: "", password: "", confirmPassword: "", cpf: "",
  dataNascimento: "", endereco: "", termsAccepted: false,
  cep: "", cidade: "", estado: "", telefone: "",
};

const fields: { name: Exclude<keyof NewAdminInput, "termsAccepted">; label: string; type?: string; placeholder?: string }[] = [
  { name: "nome", label: "Nome completo", placeholder: "Nome e sobrenome" },
  { name: "cnpj", label: "CNPJ vinculado", placeholder: "00.000.000/0000-00" },
  { name: "email", label: "E-mail", type: "email", placeholder: "nome@exemplo.com" },
  { name: "password", label: "Senha", type: "password", placeholder: "Mínimo de 8 caracteres" },
  { name: "confirmPassword", label: "Confirmar senha", type: "password" },
  { name: "cpf", label: "CPF", placeholder: "000.000.000-00" },
  { name: "dataNascimento", label: "Data de nascimento", placeholder: "DD/MM/AAAA" },
  { name: "cep", label: "CEP", placeholder: "00000-000" },
  { name: "endereco", label: "Endereço" },
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

export const MasterNewAdminPage = ({ cooperative = false }: { cooperative?: boolean }) => {
  const title = cooperative ? "Operador da cooperativa" : "Vendedor da Prefeitura";
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepResolved, setCepResolved] = useState(false);
  const showError = useGlobalModalStore((state) => state.showError);
  const showSuccess = useGlobalModalStore((state) => state.showSuccess);
  const { control, handleSubmit, setValue, setError, clearErrors, getValues, reset, formState: { errors, isSubmitting } } = useForm<NewAdminInput>({
    resolver: zodResolver(operatorSchema(cooperative)), mode: "onBlur", defaultValues: defaults,
  });

  const onSubmit = async (data: NewAdminInput) => {
    try {
      await http.post(cooperative ? "auth/register/cooperative" : "auth/register/admin", {
        name: data.nome,
        cpf: data.cpf,
        birthDate: data.dataNascimento.split("/").reverse().join("-"),
        phone: data.telefone,
        cep: data.cep,
        address: data.endereco,
        city: data.cidade,
        state: data.estado,
        email: data.email,
        password: data.password,
        passwordConfirmation: data.confirmPassword,
        termsAccepted: data.termsAccepted,
        ...(cooperative ? {} : { cnpj: data.cnpj }),
      });
      showSuccess(title + " cadastrado com sucesso.");
      reset(defaults);
      setCepResolved(false);
    } catch (error) {
      showError(apiError(error, "Não foi possível cadastrar o operador."));
    }
  };

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
      if (getValues("cep") !== cep) return;
      setValue("endereco", address.logradouro, { shouldValidate: true });
      setValue("cidade", address.localidade, { shouldValidate: true });
      setValue("estado", address.uf, { shouldValidate: true });
      setCepResolved(true);
    } catch (error) {
      if (getValues("cep") !== cep) return;
      setError("cep", { message: error instanceof Error ? error.message : "Erro ao consultar o CEP." });
    } finally {
      setLoadingCep(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.14)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">{title}</p>
        <h3 className="mt-2 text-3xl font-bold text-slate-900">Cadastro completo</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">Os formatos são aplicados durante a digitação e todos os dados são validados antes do envio.</p>
      </header>

      <section className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.14)] md:grid-cols-2">
        {fields.filter(({ name }) => !cooperative || name !== "cnpj").map(({ name, label, type = "text", placeholder }) => (
          <Controller key={name} name={name} control={control} render={({ field }) => (
            <FormInput {...field} value={String(field.value ?? "")} onChange={(event) => {
              field.onChange(maskFor(name, event.target.value));
              if (name === "cep") setCepResolved(false);
            }}
              onBlur={() => { field.onBlur(); if (name === "cep") void findCep(String(field.value)); }}
              disabled={["endereco", "cidade", "estado"].includes(name) && !cepResolved}
              id={name} label={name === "cep" && loadingCep ? "CEP · consultando..." : label} type={type} placeholder={placeholder ?? label} error={errors[name]} className="bg-white shadow-[0_5px_14px_rgba(15,23,42,0.08)]" />
          )} />
        ))}
        <Controller name="termsAccepted" control={control} render={({ field }) => (
          <label className="space-x-2 text-sm md:col-span-2">
            <input type="checkbox" checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />
            <span>O operador leu e aceitou os termos de uso.</span>
            {errors.termsAccepted && <span role="alert" className="text-red-600">{errors.termsAccepted.message}</span>}
          </label>
        )} />
        {!cepResolved && (
          <p className="-mt-2 text-sm text-slate-500 md:col-span-2">
            Informe um CEP válido para liberar os campos do endereço.
          </p>
        )}
      </section>

      <button type="submit" disabled={isSubmitting || loadingCep}
        className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(5,150,105,0.35)] transition hover:bg-emerald-700 disabled:opacity-60">
        Cadastrar operador
      </button>
    </form>
  );
};

export default MasterNewAdminPage;
