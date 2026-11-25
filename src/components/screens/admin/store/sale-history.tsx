"use client";

import { Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useApiResource } from "@/app/service/api/use-api-resource";
import { FormInput } from "@/components/ui/form-input";
import { action, card, coins, ResourceStatus } from "../municipal";

type SaleLine = {
  id: string;
  cartId: string | null;
  protocol?: string | null;
  user?: { name: string };
  sellerName?: string | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  status: string;
  completedAt: string | null;
  createdAt: string;
  product: { name: string };
};

const protocolPattern = /^(?:[0-9]{10,18}|[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12})$/i;
const dateFormat = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo",
});

export function SaleHistory({ initialProtocol = "" }: { initialProtocol?: string }) {
  const [input, setInput] = useState(initialProtocol);
  const [search, setSearch] = useState({ protocol: initialProtocol, revision: 0 });
  const [invalid, setInvalid] = useState(false);

  function lookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const protocol = input.trim().toLowerCase();
    if (!protocolPattern.test(protocol)) {
      setInvalid(true);
      setSearch((current) => ({ ...current, protocol: "" }));
      return;
    }
    setSearch((current) => ({ protocol, revision: current.revision + 1 }));
  }

  return (
    <section className="space-y-5">
      <form onSubmit={lookup} className={card}>
        <h3 className="text-xl font-bold">Consultar protocolo de venda</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1 basis-64">
            <FormInput id="sale-protocol" label="Protocolo completo" value={input} autoComplete="off" required
              onChange={(event) => { setInput(event.target.value); setInvalid(false); }}
              error={invalid ? { type: "validate", message: "Informe o protocolo completo do comprovante." } : undefined} />
          </div>
          <button type="submit" disabled={!protocolPattern.test(input.trim())} className={action + " inline-flex items-center gap-2"}>
            <Search size={16} aria-hidden="true" />Pesquisar
          </button>
        </div>
      </form>
      {search.protocol && <ProtocolResult protocol={search.protocol} revision={search.revision} />}
    </section>
  );
}

function ProtocolResult({ protocol, revision }: { protocol: string; revision: number }) {
  const result = useApiResource<{ redemptions: SaleLine[] }>("store/admin/redemptions?protocol=" + encodeURIComponent(protocol), revision);
  if (!result?.data) return <ResourceStatus error={result?.error} />;
  const lines = result.data.redemptions.filter((line) => (line.protocol === protocol || line.cartId === protocol) && line.status === "COMPLETED");
  if (!lines.length) return <p role="status" className={card}>Nenhuma venda encontrada para esse protocolo.</p>;

  const completedAt = lines[0].completedAt ?? lines[0].createdAt;
  const total = lines.reduce((sum, line) => sum + Math.round(Number(line.totalPrice) * 100), 0);
  return (
    <article className={card} aria-labelledby="sale-history-result">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h3 id="sale-history-result" className="text-xl font-bold">Venda concluída</h3>
          <p className="mt-1 break-all text-sm text-slate-600">Protocolo {lines[0].protocol ?? protocol}</p>
        </div>
        <time className="text-sm text-slate-600" dateTime={completedAt}>{dateFormat.format(new Date(completedAt))}</time>
      </div>
      <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
        <div><dt className="text-slate-600">Comprador</dt><dd className="font-semibold">{lines[0].user?.name || "Nome indisponível"}</dd></div>
        <div><dt className="text-slate-600">Vendedor</dt><dd className="font-semibold">{lines[0].sellerName || "Nome indisponível"}</dd></div>
      </dl>
      <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 px-4 dark:divide-slate-700">
        {lines.map((line) => (
          <li key={line.id} className="flex flex-wrap justify-between gap-3 py-3 text-sm">
            <div>
              <p className="font-semibold">{line.product.name}</p>
              <p className="text-slate-600">{line.quantity} × {coins(line.unitPrice)} ecocoins</p>
            </div>
            <strong>{coins(line.totalPrice)} ecocoins</strong>
          </li>
        ))}
      </ul>
      <p className="font-semibold">Total debitado · {coins(total / 100)} ecocoins</p>
    </article>
  );
}
