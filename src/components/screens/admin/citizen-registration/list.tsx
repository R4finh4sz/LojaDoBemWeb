"use client";

import { ArrowLeft, ChevronLeft, ChevronRight, Plus, UserRound } from "lucide-react";
import { useRef, useState } from "react";
import { apiError, http } from "@/app/service/api/http";
import { useApiResource } from "@/app/service/api/use-api-resource";
import { DirectoryCard, directoryGrid } from "@/components/ui/directory-card";
import ErrorModal from "@/components/ui/modal/ErrorModal";
import { useGlobalModalStore } from "@/stores/useGlobalModalStore";
import { CitizenRegistration } from ".";

type Resident = { id: string; name: string; pendingActivation: boolean };
type Registrations = { residents: Resident[]; pagination: { totalPages: number } };
const residentsUrl = "residents";
const pageButton = "inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-40 dark:border-slate-700";

export function CitizenRegistrations() {
  const [creating, setCreating] = useState(false);

  function returnToList() {
    setCreating(false);
  }

  if (creating) {
    return (
      <>
        <button type="button" onClick={returnToList}
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:underline dark:text-emerald-300">
          <ArrowLeft size={16} aria-hidden="true" /> Voltar à lista de munícipes
        </button>
        <CitizenRegistration onRegistered={returnToList} />
      </>
    );
  }
  return <CitizenRegistrationList onCreate={() => setCreating(true)} />;
}

function CitizenRegistrationList({ onCreate }: { onCreate: () => void }) {
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [selected, setSelected] = useState<Resident | null>(null);
  const [busy, setBusy] = useState(false);
  const deleting = useRef(false);
  const showError = useGlobalModalStore((state) => state.showError);
  const showSuccess = useGlobalModalStore((state) => state.showSuccess);
  const result = useApiResource<Registrations>(residentsUrl + "?page=" + page, refresh);
  const data = result?.data;

  async function removeSelected() {
    if (!selected || deleting.current) return;
    deleting.current = true;
    setBusy(true);
    setSelected(null);
    try {
      await http.delete(residentsUrl + "/" + selected.id);
      if (page > 1 && data?.residents.length === 1) setPage(page - 1);
      showSuccess("Munícipe excluído com sucesso.");
    } catch (error) {
      showError(apiError(error, "Não foi possível excluir o munícipe."));
    } finally {
      setRefresh((value) => value + 1);
      deleting.current = false;
      setBusy(false);
    }
  }

  return (
    <section className="@container space-y-5">
      <div className="flex justify-end">
        <button type="button" onClick={onCreate} disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
          <Plus size={15} aria-hidden="true" /> Cadastrar
        </button>
      </div>
      {!result && <p role="status" className="text-sm text-slate-600 dark:text-slate-300">Carregando munícipes...</p>}
      {result?.error && (
        <div className="space-y-2 text-sm">
          <p role="alert" className="text-rose-700 dark:text-rose-300">{result.error}</p>
          <button type="button" className="font-semibold text-emerald-700 underline dark:text-emerald-300" onClick={() => setRefresh((value) => value + 1)}>Tentar novamente</button>
        </div>
      )}
      {data?.residents.length === 0 && <p className="text-sm text-slate-600 dark:text-slate-300">Nenhum munícipe cadastrado.</p>}
      {!!data?.residents.length && (
        <ul className={directoryGrid}>
          {data.residents.map((resident) => (
            <DirectoryCard key={resident.id} name={resident.name} icon={UserRound} disabled={busy} onDelete={() => setSelected(resident)}>
              <p>{resident.pendingActivation ? "Aguardando ativação" : "Conta ativa"}</p>
            </DirectoryCard>
          ))}
        </ul>
      )}
      {(page > 1 || (data?.pagination.totalPages ?? 0) > 1) && (
        <nav aria-label="Paginação dos munícipes" className="flex items-center justify-between gap-2">
          <button type="button" className={pageButton} disabled={busy || page === 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft size={16} aria-hidden="true" /> Anterior
          </button>
          <span className="text-sm">Página {page}</span>
          <button type="button" className={pageButton} disabled={busy || !data || page >= data.pagination.totalPages} onClick={() => setPage(page + 1)}>
            Próxima <ChevronRight size={16} aria-hidden="true" />
          </button>
        </nav>
      )}
      <ErrorModal open={selected !== null} onClose={() => setSelected(null)} onConfirm={removeSelected}
        title="Tem certeza que deseja excluir esse usuário do sistema?"
        message="Esta ação não pode ser desfeita." closeLabel="Não" confirmLabel="Sim" />
    </section>
  );
}
