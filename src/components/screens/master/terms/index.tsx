"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FilePlus2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { apiError, http } from "@/app/service/api/http";
import { FormInput } from "@/components/ui/form-input";
import { useGlobalModalStore } from "@/stores/useGlobalModalStore";
import { masterTermsSchema, type MasterTermsInput } from "@/validation/master-terms";

export const MasterTermsPage = () => {
  const showError = useGlobalModalStore((state) => state.showError);
  const showSuccess = useGlobalModalStore((state) => state.showSuccess);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<MasterTermsInput>({
    resolver: zodResolver(masterTermsSchema),
    defaultValues: { title: "", content: "", audience: undefined },
  });

  const submit = async (data: MasterTermsInput) => {
    try {
      await http.post("terms/create", {
        title: data.title,
        text: data.content,
        type: data.audience === "user" ? "USER" : "ADMIN",
      });
      showSuccess("Termos de uso cadastrados.");
      reset();
    } catch (error) {
      showError(apiError(error, "Não foi possível cadastrar os termos."));
    }
  };

  return <form onSubmit={handleSubmit(submit)} className="space-y-6" noValidate>
    <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.14)] sm:p-8">
      <div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><FilePlus2 size={24} /></div><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Gestão de documentos</p><h3 className="mt-1 text-2xl font-bold text-slate-900">Cadastrar termos de uso</h3><p className="mt-2 text-sm leading-6 text-slate-600">Crie uma versão dos termos e defina o público que deverá aceitá-la.</p></div></div>
    </header>

    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.14)] sm:p-8">
      <div className="max-w-3xl space-y-6">
        <FormInput {...register("title")} id="terms-title" label="Título" placeholder="Ex.: Termos de uso da plataforma" error={errors.title} />
        <label className="block text-sm font-medium text-slate-700" htmlFor="terms-content">Texto dos termos<textarea {...register("content")} id="terms-content" rows={12} placeholder="Digite o conteúdo completo dos termos..." className={`mt-1.5 w-full resize-y rounded-xl border bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:bg-white focus:ring-2 ${errors.content ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20"}`} />{errors.content && <span className="mt-1.5 block text-xs text-red-600">{errors.content.message}</span>}</label>
        <fieldset><legend className="text-sm font-medium text-slate-700">Destinado a</legend><div className="mt-2 grid gap-3 sm:grid-cols-2"><label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800"><input {...register("audience")} type="radio" value="user" className="h-5 w-5 accent-emerald-600" /><span><strong className="block text-sm text-slate-900">Usuário</strong><span className="text-xs text-slate-500">Munícipes que utilizam a plataforma.</span></span></label><label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800"><input {...register("audience")} type="radio" value="admin" className="h-5 w-5 accent-emerald-600" /><span><strong className="block text-sm text-slate-900">Operadores</strong><span className="text-xs text-slate-500">Operadores da área administrativa.</span></span></label></div>{errors.audience && <span className="mt-1.5 block text-xs text-red-600">{errors.audience.message}</span>}</fieldset>
        <button type="submit" disabled={isSubmitting} className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700 disabled:opacity-60">Cadastrar termos</button>
      </div>
    </section>
  </form>;
};

export default MasterTermsPage;
