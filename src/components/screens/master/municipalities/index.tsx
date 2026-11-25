"use client";

import { Landmark } from "lucide-react";
import { useState } from "react";
import { useApiResource } from "@/app/service/api/use-api-resource";
import { inputMasks } from "@/utils/input-masks";
import { MasterDirectory } from "../directory";

type Municipality = {
  id: string;
  name: string;
  address: string | null;
  cep: string | null;
  cnpj: string | null;
  city: string | null;
  state: string | null;
};

export function MunicipalitiesPage() {
  const [refresh, setRefresh] = useState(0);
  const result = useApiResource<{ municipalities: Municipality[] }>("master/municipalities", refresh);
  const municipalities = result?.data?.municipalities;

  return (
    <MasterDirectory title="Prefeituras cadastradas" createLabel="Cadastrar prefeitura" formHref="/main/Master/new-municipality"
      emptyMessage="Nenhuma prefeitura cadastrada." icon={Landmark} error={result?.error}
      onRefresh={() => setRefresh((value) => value + 1)} deletePath={(id) => "master/municipalities/" + id}
      entries={municipalities?.map(({ id, name, address, cep, cnpj, city, state }) => ({
        id, name, details: [
          [address, city && state && `${city} – ${state.toUpperCase()}`, cep && inputMasks.cep(cep)].filter(Boolean).join(" · "),
          cnpj ? `CNPJ ${inputMasks.cnpj(cnpj)}` : "",
        ].filter(Boolean),
      }))} />
  );
}
