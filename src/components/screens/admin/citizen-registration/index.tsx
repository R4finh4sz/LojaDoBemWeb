"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check, FileText, UploadCloud, UserPlus } from "lucide-react";
import { apiError, http } from "@/app/service/api/http";
import { viaCepService } from "@/app/service/api/viaCepService";
import { FormInput } from "@/components/ui/form-input";
import { useGlobalModalStore } from "@/stores/useGlobalModalStore";
import { inputMasks } from "@/utils/input-masks";
import { citizenRegistrationSchema, type CitizenRegistrationInput } from "@/validation/citizen-registration";

const defaults: CitizenRegistrationInput = { fullName: "", cpf: "", birthDate: "", zipCode: "", address: "", addressNumber: "", email: "" };
const stepOneFields: (keyof CitizenRegistrationInput)[] = ["fullName", "cpf", "birthDate", "zipCode", "address", "addressNumber", "email"];

const mask = (name: keyof CitizenRegistrationInput, value: string) => {
  if (name === "cpf") return inputMasks.cpf(value);
  if (name === "zipCode") return inputMasks.cep(value);
  return value;
};

export function CitizenRegistration() {
  const [step, setStep] = useState<1 | 2>(1);
  const [document, setDocument] = useState<File | null>(null);
  const [documentError, setDocumentError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const showError = useGlobalModalStore((state) => state.showError);
  const showSuccess = useGlobalModalStore((state) => state.showSuccess);
  const { control, trigger, getValues, setValue, setError, clearErrors, reset, formState: { errors } } = useForm<CitizenRegistrationInput>({ resolver: zodResolver(citizenRegistrationSchema), mode: "onBlur", defaultValues: defaults });

  const findCep = async (cep: string) => {
    if (cep.replace(/\D/g, "").length !== 8) return;
    setLoadingCep(true); clearErrors("zipCode");
    try {
      const result = await viaCepService.findAddress(cep);
      if (getValues("zipCode") === cep) setValue("address", result.logradouro, { shouldValidate: true });
    } catch (error) {
      if (getValues("zipCode") !== cep) return;
      setError("zipCode", { message: error instanceof Error ? error.message : "Erro ao consultar o CEP." });
    } finally { setLoadingCep(false); }
  };

  const selectDocument = (file?: File) => {
    if (!file) return;
    if (file.type !== "application/pdf") { setDocument(null); setDocumentError("Selecione um arquivo no formato PDF."); return; }
    if (file.size > 2 * 1024 * 1024) { setDocument(null); setDocumentError("O PDF deve ter no máximo 2 MiB."); return; }
    setDocument(file); setDocumentError("");
  };

  const submit = async () => {
    setDocumentError(document ? "" : "Anexe o termo de uso assinado.");
    setTermsError(termsAccepted ? "" : "Confirme que o munícipe aceitou os termos.");
    if (!document || !termsAccepted || submitting) return;
    setSubmitting(true);
    try {
      const data = getValues();
      const bytes = new Uint8Array(await document.arrayBuffer());
      let binary = "";
      for (let offset = 0; offset < bytes.length; offset += 8192) {
        binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
      }
      await http.post("residents/pre-registrations", {
        name: data.fullName,
        cpf: data.cpf,
        birthDate: data.birthDate,
        email: data.email,
        cep: data.zipCode,
        address: data.address,
        addressNumber: data.addressNumber,
        authorizationPdf: btoa(binary),
      });
      showSuccess("Pré-cadastro concluído. O munícipe poderá ativar a conta.");
      reset(defaults);
      setDocument(null);
      setTermsAccepted(false);
      setStep(1);
    } catch (error) {
      showError(apiError(error, "Não foi possível concluir o pré-cadastro."));
    } finally {
      setSubmitting(false);
    }
  };

  const input = (name: keyof CitizenRegistrationInput, label: string, options?: { type?: string; placeholder?: string }) => <Controller name={name} control={control} render={({ field }) => <FormInput {...field} value={field.value ?? ""} id={`citizen-${name}`} label={label} type={options?.type ?? "text"} placeholder={options?.placeholder} error={errors[name]} onChange={(event) => field.onChange(mask(name, event.target.value))} onBlur={() => { field.onBlur(); if (name === "zipCode") void findCep(String(field.value)); }} />} />;

  return <section className="mt-6 space-y-6">
    <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_42px_rgba(15,23,42,0.14)] sm:p-8">
      <div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><UserPlus size={24} /></div><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Novo cadastro</p><h3 className="mt-1 text-2xl font-bold">Pré-cadastrar munícipe</h3><p className="mt-2 text-sm leading-6 text-slate-600">Cadastre os dados pessoais e anexe o termo assinado para registrar o consentimento.</p></div></div>
      <div className="mt-7 grid grid-cols-2 gap-3" aria-label="Progresso do cadastro">{[1, 2].map((number) => <div key={number} className={`border-t-4 pt-3 ${step >= number ? "border-emerald-600 text-emerald-700" : "border-slate-200 text-slate-400"}`}><span className="text-xs font-bold uppercase tracking-wider">Etapa {number}</span><p className="mt-1 text-sm font-semibold">{number === 1 ? "Dados pessoais" : "Termo assinado"}</p></div>)}</div>
    </header>
    {step === 1 ? <div className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_42px_rgba(15,23,42,0.14)] md:grid-cols-2 sm:p-8">
      <div className="md:col-span-2">{input("fullName", "Nome completo", { placeholder: "Nome e sobrenome" })}</div>
      {input("cpf", "CPF", { placeholder: "000.000.000-00" })}{input("birthDate", "Data de nascimento", { type: "date" })}{input("email", "E-mail", { type: "email", placeholder: "nome@exemplo.com" })}{input("zipCode", loadingCep ? "CEP · consultando..." : "CEP", { placeholder: "00000-000" })}{input("address", "Endereço")}{input("addressNumber", "Número")}
      <div className="flex justify-end md:col-span-2"><button type="button" disabled={loadingCep} onClick={() => void trigger(stepOneFields).then((valid) => valid && setStep(2))} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-emerald-700">Continuar <ArrowRight size={17} /></button></div>
    </div> : <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_42px_rgba(15,23,42,0.14)] sm:p-8">
      <h4 className="text-xl font-bold">Termo de uso assinado</h4><p className="mt-2 text-sm text-slate-600">Anexe o documento assinado pelo munícipe e confirme o aceite antes de concluir.</p>
      <label className={`mt-6 flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-6 text-center transition hover:bg-emerald-50 ${documentError ? "border-red-400 bg-red-50 dark:bg-red-950/45" : "border-emerald-300 bg-emerald-50/50"}`}>{document ? <><FileText className="text-emerald-700" size={38} /><strong className="mt-3 text-slate-900">{document.name}</strong><span className="mt-1 text-xs text-slate-500">{(document.size / 1024 / 1024).toFixed(2)} MB · clique para substituir</span></> : <><UploadCloud className="text-emerald-700" size={40} /><strong className="mt-3 text-slate-900">Selecionar PDF assinado</strong><span className="mt-1 text-xs text-slate-500">Apenas PDF · até 2 MiB</span></>}<input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => selectDocument(event.target.files?.[0])} /></label>
      {documentError && <p className="mt-2 text-sm text-red-600 dark:text-red-300">{documentError}</p>}
      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4"><input type="checkbox" checked={termsAccepted} onChange={(event) => { setTermsAccepted(event.target.checked); setTermsError(""); }} className="mt-0.5 h-5 w-5 accent-emerald-600" /><span className="text-sm leading-6 text-slate-700">O munícipe leu e aceitou os termos de uso. Clique aqui para confirmar o consentimento.</span></label>
      {termsError && <p className="mt-2 text-sm text-red-600 dark:text-red-300">{termsError}</p>}
      <div className="mt-7 flex flex-col-reverse justify-between gap-3 sm:flex-row"><button type="button" onClick={() => setStep(1)} disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"><ArrowLeft size={17} />Voltar</button><button type="button" onClick={submit} disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-emerald-700"><Check size={17} />Concluir cadastro</button></div>
    </div>}
  </section>;
}

