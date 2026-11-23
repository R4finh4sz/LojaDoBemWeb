"use client";

import { useApiResource } from "@/app/service/api/use-api-resource";
import { MasterActivity, type MasterDashboard } from "../dashboard";

export const MasterLogsPage = () => {
  const result = useApiResource<MasterDashboard>("master/dashboard");
  if (!result?.data) return <p role={result?.error ? "alert" : "status"}>{result?.error ?? "Carregando atividade..."}</p>;
  return <MasterActivity activity={result.data.recentActivity} />;
};

export default MasterLogsPage;
