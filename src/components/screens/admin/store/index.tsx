"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { CheckCircle2, Coins, Printer, Search, UserCheck, X } from "lucide-react";
import Modal from "@/components/ui/modal/Modal";

type StoreItem = { id: number; name: string; description: string; value: number; image: string; stock: number };
type Citizen = { id: string; name: string; gamertag: string; cpf: string; balance: number };
type ExchangeReceipt = { protocol: string; item: StoreItem; citizen: Citizen; previousBalance: number; remainingBalance: number; operator: string; createdAt: Date };

const storeItems: StoreItem[] = [
  { id: 1, name: "Garrafa térmica reciclada", description: "Garrafa de aço reciclado com capacidade de 600 ml.", value: 850, image: "/mock-bottle.svg", stock: 18 },
  { id: 2, name: "Ecobag retornável", description: "Bolsa reutilizável de alta resistência produzida com tecido reciclado.", value: 420, image: "/mock-bag.svg", stock: 32 },
];

const citizens: Citizen[] = [
  { id: "USR-1042", name: "Ana Souza", gamertag: "ana.eco", cpf: "52998224725", balance: 1240 },
  { id: "USR-2087", name: "Carlos Lima", gamertag: "carlosverde", cpf: "11144477735", balance: 680 },
  { id: "USR-3159", name: "Beatriz Costa", gamertag: "biarecicla", cpf: "12345678909", balance: 2100 },
];

const normalizeSearch = (value: string) => value.trim().toLowerCase();
const maskCpf = (cpf: string) => `***.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-**`;

type AdminStoreProps = { operatorName: string };

export function AdminStore({ operatorName }: AdminStoreProps) {
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [citizen, setCitizen] = useState<Citizen | null>(null);
  const [receipt, setReceipt] = useState<ExchangeReceipt | null>(null);

  const close = () => { setSelectedItem(null); setQuery(""); setSearched(false); setCitizen(null); setReceipt(null); };
  const startExchange = (item: StoreItem) => { setSelectedItem(item); setQuery(""); setSearched(false); setCitizen(null); setReceipt(null); };
  const searchCitizen = () => {
    const normalized = normalizeSearch(query);
    const digits = query.replace(/\D/g, "");
    const result = citizens.find((item) => item.gamertag.toLowerCase() === normalized || (digits.length === 11 && item.cpf === digits)) ?? null;
    setCitizen(result); setSearched(true);
  };
  const confirmExchange = () => {
    if (!selectedItem || !citizen || citizen.balance < selectedItem.value) return;
    setReceipt({ protocol: `TRC-${Date.now().toString().slice(-8)}`, item: selectedItem, citizen, previousBalance: citizen.balance, remainingBalance: citizen.balance - selectedItem.value, operator: operatorName, createdAt: new Date() });
  };

  return <section className="mt-6 space-y-6">
    <header><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Catálogo de recompensas</p><h3 className="mt-2 text-2xl font-bold">Loja</h3><p className="mt-2 text-sm text-slate-600">Selecione um item para realizar a troca de ecocoins do munícipe.</p></header>
    <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">{storeItems.map((item) => <article key={item.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_42px_rgba(15,23,42,0.12)]">
      <div className="aspect-[16/10] overflow-hidden bg-emerald-50"><img src={item.image} alt={item.name} className="h-full w-full object-cover" /></div>
      <div className="p-6"><div className="flex items-start justify-between gap-4"><h4 className="text-lg font-bold text-slate-900">{item.name}</h4><span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{item.stock} disponíveis</span></div><p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">{item.description}</p><div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-5"><div><span className="text-xs text-slate-500">Valor da troca</span><strong className="mt-1 flex items-center gap-1.5 text-xl text-emerald-700"><Coins size={18} />{item.value.toLocaleString("pt-BR")}</strong></div><button type="button" onClick={() => startExchange(item)} className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700">Trocar</button></div></div>
    </article>)}</div>

    <Modal open={selectedItem !== null} onClose={close}>
      {selectedItem && !receipt && <div><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Realizar troca</p><h3 className="mt-1 text-xl font-bold">{selectedItem.name}</h3><p className="mt-1 text-sm font-semibold text-emerald-700">{selectedItem.value.toLocaleString("pt-BR")} ecocoins</p></div><button type="button" onClick={close} aria-label="Fechar" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={20} /></button></div>
        <label htmlFor="customer-search" className="mt-6 block text-sm font-semibold text-slate-700">Gamertag ou CPF do cliente</label><div className="mt-2 flex gap-2"><input id="customer-search" value={query} onChange={(event) => { setQuery(event.target.value); setSearched(false); setCitizen(null); }} onKeyDown={(event) => { if (event.key === "Enter") searchCitizen(); }} placeholder="Ex.: ana.eco ou 000.000.000-00" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:bg-white" /><button type="button" onClick={searchCitizen} className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 text-white" aria-label="Pesquisar cliente"><Search size={18} /></button></div>
        <p className="mt-2 text-xs text-slate-500">Para testar: ana.eco, carlosverde ou biarecicla.</p>
        {searched && !citizen && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">Nenhum munícipe encontrado com esses dados.</p>}
        {citizen && <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-start gap-3"><UserCheck className="mt-0.5 shrink-0 text-emerald-700" size={23} /><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Cliente encontrado</p><h4 className="mt-1 font-bold text-slate-900">{citizen.name}</h4><p className="mt-1 text-sm text-slate-600">@{citizen.gamertag} · {maskCpf(citizen.cpf)}</p><p className="mt-3 text-sm text-slate-600">Saldo: <strong className="text-slate-900">{citizen.balance.toLocaleString("pt-BR")} ecocoins</strong></p></div></div>
          {citizen.balance < selectedItem.value ? <p className="mt-4 rounded-xl bg-red-100 p-3 text-sm font-semibold text-red-700">Saldo insuficiente para realizar esta troca.</p> : <button type="button" onClick={confirmExchange} className="mt-5 w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-emerald-700">Confirmar cliente e realizar troca</button>}
        </div>}
      </div>}

      {receipt && <div><div className="text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 size={32} /></div><p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Troca concluída</p><h3 className="mt-1 text-xl font-bold">Comprovante da troca</h3></div><div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm"><p className="flex justify-between gap-4"><span>Protocolo</span><strong>{receipt.protocol}</strong></p><p className="flex justify-between gap-4"><span>Munícipe</span><strong className="text-right">{receipt.citizen.name}</strong></p><p className="flex justify-between gap-4"><span>Gamertag</span><strong>@{receipt.citizen.gamertag}</strong></p><p className="flex justify-between gap-4"><span>Item</span><strong className="text-right">{receipt.item.name}</strong></p><p className="flex justify-between gap-4"><span>Valor</span><strong>{receipt.item.value.toLocaleString("pt-BR")} ecocoins</strong></p><p className="flex justify-between gap-4"><span>Saldo anterior</span><strong>{receipt.previousBalance.toLocaleString("pt-BR")}</strong></p><p className="flex justify-between gap-4"><span>Saldo restante</span><strong className="text-emerald-700">{receipt.remainingBalance.toLocaleString("pt-BR")}</strong></p><p className="flex justify-between gap-4"><span>Operador</span><strong>{receipt.operator}</strong></p><p className="flex justify-between gap-4"><span>Data</span><strong className="text-right">{receipt.createdAt.toLocaleString("pt-BR")}</strong></p></div><div className="mt-5 grid grid-cols-2 gap-3"><button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700"><Printer size={17} />Imprimir</button><button type="button" onClick={close} className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white">Concluir</button></div></div>}
    </Modal>
  </section>;
}
