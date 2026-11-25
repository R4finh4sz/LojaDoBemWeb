"use client";

import Image from "next/image";
import { Mail, MapPin, Pencil } from "lucide-react";
import { useState, type FormEvent } from "react";
import { apiError, http } from "@/app/service/api/http";
import { FormInput } from "@/components/ui/form-input";

export type AccountProfile = { name: string; email: string; address: string; addressNumber: string | null; jobTitle: string | null; profilePhoto: string | null; twoFactorEnabled: boolean };

const imageTypes = ["image/jpeg", "image/png", "image/webp"];
const primary = "rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50";

export function allowedPhoto(value: string | null): value is string {
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

export function ProfileDetails({ profile, onSaved }: {
  profile: AccountProfile;
  onSaved: (profile: AccountProfile) => void;
}) {
  const [address, setAddress] = useState(profile.address ?? "");
  const [photo, setPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const preview = photo ?? profile.profilePhoto;
  const initials = (profile.name ?? "").trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const addressChanged = address.trim() !== (profile.address ?? "");
  const hasChanges = Boolean(addressChanged || photo);
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
    if (busy || !hasChanges || (addressChanged && !address.trim())) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const { data } = await http.patch<AccountProfile>("account/profile", {
        ...(addressChanged && { address: address.trim() }),
        ...(photo && { profilePhoto: photo }),
      });
      onSaved(data);
      setAddress(data.address ?? "");
      setPhoto(null);
      setSaved(true);
    } catch (error) {
      setError(apiError(error, "Não foi possível salvar as alterações."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="min-w-0 space-y-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="relative">
          <div className="relative flex size-36 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-4xl font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
            {allowedPhoto(preview) ? (
              <Image src={preview} alt="Foto de perfil" fill sizes="144px" unoptimized className="object-cover" />
            ) : <span aria-hidden="true">{initials || "?"}</span>}
          </div>
          <label title="Alterar foto" className="absolute bottom-0 right-0 grid size-10 cursor-pointer place-items-center rounded-full border border-slate-200 bg-white text-emerald-800 shadow-sm focus-within:ring-2 focus-within:ring-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-200">
            <Pencil size={16} aria-hidden="true" />
            <input type="file" accept={imageTypes.join(",")} aria-label="Alterar foto de perfil" disabled={busy}
              className="absolute inset-0 h-full w-full cursor-pointer rounded-full opacity-0 disabled:cursor-wait"
              onChange={(event) => {
                void selectPhoto(event.target.files?.[0]);
                event.target.value = "";
              }} />
          </label>
        </div>
        {profile.name && <p className="break-words text-lg font-semibold">{profile.name}</p>}
        {preparing && <p role="status" className="text-sm text-slate-600">Preparando foto...</p>}
      </div>

      <section className="space-y-4 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-5 dark:border-emerald-900 dark:bg-emerald-950/35">
        <h4 className="text-base font-semibold">Meus dados</h4>
        <div className="flex items-center gap-3 text-sm">
          <Mail size={17} aria-hidden="true" className="shrink-0 text-emerald-700 dark:text-emerald-300" />
          <dl className="min-w-0">
            <dt className="text-xs text-slate-600">E-mail</dt>
            <dd className="break-all">{profile.email}</dd>
          </dl>
        </div>
        <div className="flex items-start gap-3 border-t border-emerald-200/70 pt-4 dark:border-emerald-900">
          <MapPin size={17} aria-hidden="true" className="mt-1 shrink-0 text-emerald-700 dark:text-emerald-300" />
          <div className="min-w-0 flex-1">
            <FormInput id="profile-address" label="Endereço" value={address} maxLength={255} disabled={busy}
              onChange={(event) => {
                setAddress(event.target.value);
                setSaved(false);
              }} />
          </div>
        </div>
        {hasChanges && (
          <button type="submit" className={primary} disabled={busy || (addressChanged && !address.trim())}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        )}
        {saved && <p role="status" className="text-sm text-emerald-800 dark:text-emerald-300">Dados atualizados.</p>}
        {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
      </section>
    </form>
  );
}
