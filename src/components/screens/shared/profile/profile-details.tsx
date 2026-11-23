"use client";

import Image from "next/image";
import { Camera, Download } from "lucide-react";
import { useState, type FormEvent } from "react";
import { apiError, http } from "@/app/service/api/http";
import { FormInput } from "@/components/ui/form-input";

export type AccountProfile = { email: string; jobTitle: string | null; profilePhoto: string | null };

const imageTypes = ["image/jpeg", "image/png", "image/webp"];
const primary = "rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50";
const secondary = "inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 dark:hover:bg-slate-800";

function allowedPhoto(value: string | null): value is string {
  return Boolean(value && /^(https?:\/\/|\/(?!\/)|data:image\/(jpeg|png|webp);base64,)/i.test(value));
}

async function resizePhoto(file: File) {
  if (!imageTypes.includes(file.type) || !file.size || file.size > 5 * 1024 * 1024) {
    throw new Error("Escolha uma foto JPG, PNG ou WebP de até 5 MiB.");
  }
  const image = await createImageBitmap(file).catch(() => {
    throw new Error("Não foi possível abrir a foto selecionada.");
  });
  try {
    const scale = Math.min(1, 320 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Não foi possível preparar a foto.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/webp", 0.85);
  } finally {
    image.close();
  }
}

export function ProfileDetails({ profile, roleLabel, onSaved }: {
  profile: AccountProfile;
  roleLabel: string;
  onSaved: (profile: AccountProfile) => void;
}) {
  const [jobTitle, setJobTitle] = useState(profile.jobTitle ?? "");
  const [photo, setPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const preview = photo ?? profile.profilePhoto;
  const titleChanged = jobTitle.trim() !== (profile.jobTitle ?? "");
  const busy = preparing || saving;

  async function selectPhoto(file?: File) {
    if (!file) return;
    setPreparing(true);
    setError("");
    setSaved(false);
    try {
      setPhoto(await resizePhoto(file));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Não foi possível preparar a foto.");
    } finally {
      setPreparing(false);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || (!titleChanged && !photo)) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const { data } = await http.patch<AccountProfile>("account/profile", {
        ...(titleChanged && { jobTitle: jobTitle.trim() }),
        ...(photo && { profilePhoto: photo }),
      });
      onSaved(data);
      setJobTitle(data.jobTitle ?? "");
      setPhoto(null);
      setSaved(true);
    } catch (error) {
      setError(apiError(error, "Não foi possível salvar as alterações."));
    } finally {
      setSaving(false);
    }
  }

  async function exportData() {
    setExporting(true);
    setError("");
    try {
      const { data } = await http.get<unknown>("account/export?format=json");
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "meus-dados.json";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setError(apiError(error, "Não foi possível exportar seus dados."));
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="space-y-5">
      <h4 className="text-2xl font-bold">Meus dados</h4>
      <form onSubmit={save} className="grid gap-5 sm:grid-cols-[9rem_minmax(0,1fr)]">
        <label className="relative flex h-36 w-36 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-dashed border-emerald-500 bg-slate-50 text-center focus-within:ring-2 focus-within:ring-emerald-500">
          {allowedPhoto(preview) ? (
            <Image src={preview} alt="Foto de perfil" fill sizes="144px" unoptimized className="object-cover" />
          ) : <Camera size={25} aria-hidden="true" className="text-emerald-700 dark:text-emerald-300" />}
          <span className={allowedPhoto(preview) ? "absolute inset-x-0 bottom-0 bg-slate-950/75 py-1.5 text-xs font-semibold text-white" : "text-xs font-semibold"}>
            {preparing ? "Preparando foto..." : "Alterar foto"}
          </span>
          <input type="file" accept={imageTypes.join(",")} aria-label="Selecionar foto de perfil" disabled={busy}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-wait"
            onChange={(event) => {
              void selectPhoto(event.target.files?.[0]);
              event.target.value = "";
            }} />
        </label>
        <div className="space-y-4">
          <FormInput id="profile-email" value={profile.email} readOnly type="email" label="E-mail" />
          <FormInput id="profile-job-title" label="Função" value={jobTitle} maxLength={100} placeholder={roleLabel} disabled={busy}
            onChange={(event) => {
              setJobTitle(event.target.value);
              setSaved(false);
            }} />
        </div>
        <div className="flex flex-wrap gap-3 sm:col-start-2">
          <button type="submit" className={primary} disabled={busy || (!titleChanged && !photo)}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
          <button type="button" className={secondary} onClick={exportData} disabled={exporting}>
            <Download size={16} aria-hidden="true" />{exporting ? "Exportando..." : "Exportar meus dados em JSON"}
          </button>
        </div>
      </form>
      {saved && <p role="status" className="text-sm text-emerald-800 dark:text-emerald-300">Dados atualizados.</p>}
      {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
    </section>
  );
}
