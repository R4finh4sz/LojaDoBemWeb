"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Clock3, KeyRound, LogOut, Settings2, UserCircle2, UserRoundPen } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clearAuthSession, getStoredAvatarUrl, getStoredUserEmail, getStoredUserName, setStoredAvatarUrl } from "@/app/service/api/auth-session";
import { FormInput } from "@/components/ui/form-input";
import { useGlobalModalStore } from "@/stores/useGlobalModalStore";
import { changePasswordSchema, profileDataSchema, type ChangePasswordInput, type ProfileDataInput } from "@/validation/profile";
import ErrorModal from "@/components/ui/modal/ErrorModal";
import { inputMasks } from "@/utils/input-masks";

type ProfileTab = "access" | "password" | "data" | "preferences";
const tabs = [
  { id: "access", label: "Histórico de acesso", icon: Clock3 },
  { id: "password", label: "Alterar senha", icon: KeyRound },
  { id: "data", label: "Meus dados", icon: UserRoundPen },
  { id: "preferences", label: "Preferências", icon: Settings2 },
] satisfies { id: ProfileTab; label: string; icon: typeof Clock3 }[];

const history = [
  ["Hoje, 10:32", "Chrome · Windows", "São Paulo, SP", "Sessão atual"],
  ["20/07/2026, 18:14", "Safari · iPhone", "São Paulo, SP", "Concluída"],
  ["19/07/2026, 09:03", "Chrome · Windows", "Campinas, SP", "Concluída"],
];

type ProfilePageProps = {
  roleLabel?: "Master" | "Administrador";
};

export const ProfilePage = ({ roleLabel = "Master" }: ProfilePageProps) => {
  const router = useRouter();
  const [tab, setTab] = useState<ProfileTab>("access");
  const [preview, setPreview] = useState<string | null>(() => getStoredAvatarUrl());
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [preferences, setPreferences] = useState({ security: true, reports: true, compact: false });
  const showSuccess = useGlobalModalStore((state) => state.showSuccess);
  const userName = getStoredUserName() ?? roleLabel;
  const userEmail = getStoredUserEmail() ?? (roleLabel === "Master" ? "master@reciclaonline.com" : "admin@reciclaonline.com");
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });
  const dataForm = useForm<ProfileDataInput>({
    resolver: zodResolver(profileDataSchema),
    defaultValues: { phone: "(11) 99999-9999", gender: "Feminino", cep: "01001-000", address: "Praça da Sé", number: "100", complement: "", district: "Sé", city: "São Paulo", state: "SP" },
  });

  const logout = () => { clearAuthSession(); router.replace("/Auth/Login"); };
  const changePassword = () => { showSuccess("Senha validada. A alteração será integrada ao backend."); reset(); };
  const saveData = () => showSuccess("Dados pessoais validados e salvos na demonstração.");
  const selectPhoto = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      setPreview(reader.result);
      setStoredAvatarUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.14)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-emerald-100 text-emerald-700 shadow-md">
            {preview ? (
              <img src={preview} alt="Prévia do perfil" className="h-full w-full object-cover" />
            ) : <UserCircle2 size={42} />}
          </div>
          <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">Perfil {roleLabel}</p><h3 className="mt-1 text-2xl font-bold">{userName}</h3></div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        <nav className="h-fit rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_18px_48px_rgba(15,23,42,0.14)]">
          {tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} className={`mb-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold last:mb-0 ${tab === id ? "bg-emerald-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"}`}><Icon size={18} />{label}</button>)}
        </nav>

        <article className="min-h-[430px] rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.14)] sm:p-8">
          {tab === "access" && <div><h4 className="text-2xl font-bold">Histórico de acesso</h4><p className="mt-2 text-sm text-slate-600">Revise dispositivos e locais que acessaram sua conta.</p><div className="mt-6 divide-y divide-slate-200">{history.map(([date, device, location, status]) => <div key={date} className="grid gap-2 py-4 first:pt-0 sm:grid-cols-[1.2fr_1fr_1fr_auto]"><strong className="text-sm">{date}</strong><span className="text-sm text-slate-600">{device}</span><span className="text-sm text-slate-600">{location}</span><span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{status}</span></div>)}</div></div>}

          {tab === "password" && <form onSubmit={handleSubmit(changePassword)} className="max-w-xl space-y-5"><h4 className="text-2xl font-bold">Alteração de senha</h4><p className="text-sm text-slate-600">Use uma senha forte e diferente das anteriores.</p><FormInput {...register("currentPassword")} type="password" label="Senha atual" error={errors.currentPassword} /><FormInput {...register("newPassword")} type="password" label="Nova senha" error={errors.newPassword} /><FormInput {...register("confirmPassword")} type="password" label="Confirmar nova senha" error={errors.confirmPassword} /><button className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg">Salvar nova senha</button></form>}

          {tab === "data" && (
            <form onSubmit={dataForm.handleSubmit(saveData)}>
              <h4 className="text-2xl font-bold">Meus dados</h4>
              <p className="mt-2 text-sm text-slate-600">Consulte todos os dados vinculados à sua conta. Informações de identificação ficam bloqueadas.</p>
              <div className="mt-7 grid gap-7 xl:grid-cols-[180px_1fr]">
                <div>
                  <label className="flex h-40 w-40 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-emerald-300 bg-emerald-50 text-center">
                    {preview ? <img src={preview} alt="Prévia do perfil" className="h-full w-full object-cover"/> : <><Camera className="text-emerald-700" size={30}/><span className="mt-2 text-xs font-semibold">Alterar foto</span></>}
                    <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => selectPhoto(event.target.files?.[0])}/>
                  </label>
                  <p className="mt-2 text-xs text-slate-500">JPG, PNG ou WebP · até 5 MB</p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <FormInput value={userName} disabled label="Nome completo" />
                  <FormInput value={userEmail} disabled type="email" label="E-mail" />
                  <FormInput value="529.982.247-25" disabled label="CPF" />
                  <FormInput value="15/01/1990" disabled label="Data de nascimento" />
                  <Controller name="phone" control={dataForm.control} render={({ field }) => <FormInput {...field} label="Telefone" error={dataForm.formState.errors.phone} onChange={(event) => field.onChange(inputMasks.phone(event.target.value))}/>}/>
                  <label className="block text-sm font-medium text-slate-700">Sexo<select {...dataForm.register("gender")} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-400"><option value="">Selecione</option><option>Feminino</option><option>Masculino</option><option>Não binário</option><option>Prefiro não informar</option></select>{dataForm.formState.errors.gender && <span className="mt-1 block text-xs text-red-600">{dataForm.formState.errors.gender.message}</span>}</label>
                  <Controller name="cep" control={dataForm.control} render={({ field }) => <FormInput {...field} label="CEP" error={dataForm.formState.errors.cep} onChange={(event) => field.onChange(inputMasks.cep(event.target.value))}/>}/>
                  <FormInput {...dataForm.register("address")} label="Endereço" error={dataForm.formState.errors.address}/>
                  <FormInput {...dataForm.register("number")} label="Número" error={dataForm.formState.errors.number}/>
                  <FormInput {...dataForm.register("complement")} label="Complemento" error={dataForm.formState.errors.complement}/>
                  <FormInput {...dataForm.register("district")} label="Bairro" error={dataForm.formState.errors.district}/>
                  <FormInput {...dataForm.register("city")} label="Cidade" error={dataForm.formState.errors.city}/>
                  <FormInput {...dataForm.register("state")} label="Estado" error={dataForm.formState.errors.state}/>
                  <FormInput value={roleLabel} disabled label="Função" helpText="Definida pela permissão da conta."/>
                </div>
              </div>
              <button className="mt-7 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg">Salvar alterações</button>
            </form>
          )}

          {tab === "preferences" && <div><h4 className="text-2xl font-bold">Preferências da conta</h4><p className="mt-2 text-sm text-slate-600">Personalize notificações e a exibição do painel.</p><div className="mt-6 max-w-2xl space-y-3">{[["security", "Alertas de segurança", "Receber avisos sobre acessos e bloqueios."], ["reports", "Resumo semanal", "Receber o resumo operacional por e-mail."], ["compact", "Visualização compacta", "Reduzir espaçamentos e densidade do painel."]].map(([key, title, description]) => <label key={key} className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 p-4 shadow-sm"><span><strong className="block text-sm">{title}</strong><span className="text-xs text-slate-500">{description}</span></span><input type="checkbox" checked={preferences[key as keyof typeof preferences]} onChange={() => setPreferences((current) => ({ ...current, [key]: !current[key as keyof typeof current] }))} className="h-5 w-5 accent-emerald-600" /></label>)}</div><button onClick={() => showSuccess("Preferências salvas localmente.")} className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg">Salvar preferências</button></div>}
        </article>
      </div>
      <ErrorModal open={logoutOpen} title="Sair da conta?" message="Tem certeza que deseja encerrar sua sessão?" closeLabel="Cancelar" confirmLabel="Sair" onClose={() => setLogoutOpen(false)} onConfirm={logout} />
    </section>
  );
};

export const MasterProfilePage = () => <ProfilePage roleLabel="Master" />;

export default MasterProfilePage;
