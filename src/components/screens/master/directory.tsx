"use client";

import { Plus, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { apiError, http } from "@/app/service/api/http";
import { DirectoryCard, directoryGrid } from "@/components/ui/directory-card";
import ErrorModal from "@/components/ui/modal/ErrorModal";
import { useGlobalModalStore } from "@/stores/useGlobalModalStore";

type Entry = { id: string; name: string; details: string[] };
type Props = {
  title: string;
  createLabel: string;
  formHref: string;
  emptyMessage: string;
  entries?: Entry[];
  error?: string;
  icon: LucideIcon;
  onRefresh: () => void;
  deletePath: (id: string) => string;
};

export function MasterDirectory({ title, createLabel, formHref, emptyMessage, entries, error, icon, onRefresh, deletePath }: Props) {
  const [selected, setSelected] = useState<Entry | null>(null);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const showError = useGlobalModalStore((state) => state.showError);
  const showSuccess = useGlobalModalStore((state) => state.showSuccess);

  async function confirmDelete() {
    if (!selected || pending.current) return;
    pending.current = true;
    setBusy(true);
    setSelected(null);
    try {
      await http.delete(deletePath(selected.id));
      onRefresh();
      showSuccess("Cadastro excluído com sucesso.");
    } catch (error) {
      showError(apiError(error, "Não foi possível excluir o cadastro."));
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <section aria-label={title} className="@container space-y-5">
      <div className="flex justify-end">
        <Link href={formHref} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800">
          <Plus size={15} aria-hidden="true" /> {createLabel}
        </Link>
      </div>
      {!entries && !error && <p role="status" className="text-sm text-slate-600 dark:text-slate-300">Carregando cadastros...</p>}
      {error && (
        <div className="space-y-2 text-sm">
          <p role="alert" className="text-rose-700 dark:text-rose-300">{error}</p>
          <button type="button" onClick={onRefresh} className="font-semibold text-emerald-700 underline dark:text-emerald-300">Tentar novamente</button>
        </div>
      )}
      {entries?.length === 0 && <p className="text-sm text-slate-600 dark:text-slate-300">{emptyMessage}</p>}
      {!!entries?.length && (
        <ul className={directoryGrid}>
          {entries.map((entry) => (
            <DirectoryCard key={entry.id} name={entry.name} icon={icon} disabled={busy} onDelete={() => setSelected(entry)}>
              {entry.details.map((detail, index) => <p key={index}>{detail}</p>)}
            </DirectoryCard>
          ))}
        </ul>
      )}
      <ErrorModal open={selected !== null} onClose={() => setSelected(null)} onConfirm={confirmDelete}
        title="Tem certeza que deseja excluir este cadastro?"
        message={selected?.name} closeLabel="Não" confirmLabel="Sim" />
    </section>
  );
}
