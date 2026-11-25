"use client";

import { UsersRound, UserRound } from "lucide-react";
import { useState } from "react";
import { useApiResource } from "@/app/service/api/use-api-resource";
import { MasterDirectory } from "../directory";

type Operator = {
  id: string;
  name: string;
  email: string;
  municipality: { name: string | null; city: string; state: string } | null;
};

const lists = {
  vendors: {
    role: "PrefeituraVendedor",
    title: "Vendedores cadastrados",
    button: "Cadastrar vendedor",
    form: "/main/Master/new-admin",
    empty: "Nenhum vendedor cadastrado.",
  },
  cooperatives: {
    role: "COOPERATIVA",
    title: "Cooperativas cadastradas",
    button: "Cadastrar cooperativa",
    form: "/main/Master/new-cooperative",
    empty: "Nenhum operador de cooperativa cadastrado.",
  },
};

export function OperatorsPage({ cooperative = false }: { cooperative?: boolean }) {
  const list = cooperative ? lists.cooperatives : lists.vendors;
  const [refresh, setRefresh] = useState(0);
  const result = useApiResource<{ operators: Operator[] }>("master/operators?role=" + list.role, refresh);
  const operators = result?.data?.operators;

  return (
    <MasterDirectory title={list.title} createLabel={list.button} formHref={list.form} emptyMessage={list.empty}
      icon={cooperative ? UsersRound : UserRound} error={result?.error} onRefresh={() => setRefresh((value) => value + 1)}
      deletePath={(id) => "master/operators/" + id + "?role=" + list.role}
      entries={operators?.map(({ id, name, email, municipality }) => ({
        id, name, details: municipality
          ? [email, municipality.name || `${municipality.city} – ${municipality.state.toUpperCase()}`]
          : [email],
      }))} />
  );
}
