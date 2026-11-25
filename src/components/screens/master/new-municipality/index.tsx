"use client";

import { ArrowLeft, Landmark } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiError, http } from "@/app/service/api/http";
import { FormInput } from "@/components/ui/form-input";
import { useGlobalModalStore } from "@/stores/useGlobalModalStore";
import { inputMasks, normalizeCnpj } from "@/utils/input-masks";
import { isValidCnpj } from "@/validation/new-admin";

const schema = z.object({
  name: z.string().trim().min(2, "Informe o nome da prefeitura.").max(150),
  address: z.string().trim().min(1, "Informe o endereço da prefeitura.").max(255),
  cep: z.string().regex(/^\d{5}-?\d{3}$/, "Informe um CEP válido."),
  cnpj: z.string().refine(isValidCnpj, "Informe um CNPJ válido."),
});
type MunicipalityInput = z.infer<typeof schema>;
const defaults = { name: "", address: "", cep: "", cnpj: "" };

export function NewMunicipalityPage() {
  const router = useRouter();
  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting, isValid } } =
    useForm<MunicipalityInput>({ resolver: zodResolver(schema), defaultValues: defaults, mode: "onChange" });
  const showError = useGlobalModalStore((state) => state.showError);
  const showSuccess = useGlobalModalStore((state) => state.showSuccess);

  async function submit(data: MunicipalityInput) {
    try {
      await http.post("master/municipalities", {
        ...data,
        cep: data.cep.replace("-", ""),
        cnpj: normalizeCnpj(data.cnpj),
      });
      reset(defaults);
      router.replace("/main/Master/municipalities");
      showSuccess("Prefeitura cadastrada com sucesso.");
    } catch (error) {
      showError(apiError(error, "Não foi possível cadastrar a prefeitura."));
    }
  }

  return (
    <section className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-900">
      <Link href="/main/Master/municipalities" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-300">
        <ArrowLeft size={16} aria-hidden="true" /> Voltar às prefeituras
      </Link>
      <header className="mb-6 flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          <Landmark size={22} aria-hidden="true" />
        </span>
        <h3 className="text-xl font-semibold sm:text-2xl">Dados da prefeitura</h3>
      </header>
      <form onSubmit={handleSubmit(submit)} noValidate className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormInput {...register("name")} label="Nome" maxLength={150} required disabled={isSubmitting} error={errors.name} />
        </div>
        <Controller name="cnpj" control={control} render={({ field }) => (
          <FormInput {...field} label="CNPJ" placeholder="00.000.000/0000-00" maxLength={18} spellCheck={false}
            required disabled={isSubmitting} error={errors.cnpj}
            onChange={(event) => field.onChange(inputMasks.cnpj(event.target.value))} />
        )} />
        <Controller name="cep" control={control} render={({ field }) => (
          <FormInput {...field} label="CEP" inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" maxLength={9}
            required disabled={isSubmitting} error={errors.cep}
            helpText="O CEP identifica o município e a UF."
            onChange={(event) => field.onChange(inputMasks.cep(event.target.value))} />
        )} />
        <div className="sm:col-span-2">
          <FormInput {...register("address")} label="Endereço" autoComplete="street-address" maxLength={255}
            required disabled={isSubmitting} error={errors.address} />
        </div>
        <button type="submit" disabled={isSubmitting || !isValid}
          className="justify-self-end rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60 sm:col-span-2">
          {isSubmitting ? "Cadastrando..." : "Cadastrar prefeitura"}
        </button>
      </form>
    </section>
  );
}
