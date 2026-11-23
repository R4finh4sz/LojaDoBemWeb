"use client";

import { useState, type FormEvent } from "react";
import { apiError, http } from "@/app/service/api/http";
import { useApiResource } from "@/app/service/api/use-api-resource";
import { FormInput } from "@/components/ui/form-input";

export type Product = {
  id: string; name: string; description: string; price: string; quantity: number; barcode: string | null;
};
export type InventoryData = { products: Product[]; pagination: { totalPages: number } };
export const productUrl = "store/admin/products";
export const card = "space-y-4 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900";
export const action = "rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50";
export const coins = (value: string | number) => Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 2 });

export function ResourceStatus({ error }: { error?: string }) {
  return error ? <p role="alert" className="text-red-700">{error}</p> : <p role="status">Carregando...</p>;
}

type Dashboard = {
  ordersCollected: number; usersServed: number; pointsRedeemed: string;
  recentOrders: { id: string; user: { name: string | null }; collectedAt: string; items: { productId: string; name: string; quantity: number }[] }[];
  topItems: { productId: string; productName: string; units: number }[];
};

export function MunicipalDashboard() {
  const result = useApiResource<Dashboard>("store/admin/dashboard");
  if (!result?.data) return <ResourceStatus error={result?.error} />;
  const data = result.data;
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[["Pedidos coletados", data.ordersCollected], ["Munícipes atendidos", data.usersServed], ["Ecocoins resgatados", data.pointsRedeemed]].map(([label, value]) => (
          <article key={label} className={card}><h3>{label}</h3><p className="text-2xl font-bold">{coins(value)}</p></article>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <section className={card}>
          <h3 className="text-xl font-bold">Pedidos recentes</h3>
          {!data.recentOrders.length && <p>Nenhum pedido coletado.</p>}
          {data.recentOrders.map((order) => (
            <div key={order.id} className="border-t border-slate-200 pt-3 text-sm">
              <strong>{order.user.name ?? "Munícipe"}</strong>
              <p>{order.items.map((item) => item.quantity + " × " + item.name).join(", ")}</p>
              <time>{new Date(order.collectedAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</time>
            </div>
          ))}
        </section>
        <section className={card}>
          <h3 className="text-xl font-bold">Itens mais retirados</h3>
          {!data.topItems.length && <p>Nenhum item retirado.</p>}
          {data.topItems.map((item) => <p key={item.productId}>{item.productName} · {item.units} un.</p>)}
        </section>
      </div>
    </div>
  );
}

export function CreateProduct() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      await http.post(productUrl, {
        name: values.get("name"), description: values.get("description"), photo: values.get("photo"),
        barcode: String(values.get("barcode")).trim() || undefined,
        price: values.get("price"), quantity: Number(values.get("quantity")),
      });
      form.reset();
      setSaved(true);
    } catch (error) {
      setError(apiError(error, "Não foi possível cadastrar o item."));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className={card} onSubmit={submit}>
      <h3 className="text-xl font-bold">Cadastrar item</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput label="Nome" name="name" required maxLength={120} />
        <FormInput label="Descrição" name="description" required maxLength={2000} />
        <FormInput label="URL da foto" name="photo" type="url" required maxLength={2048} />
        <FormInput label="Código de barras" name="barcode" />
        <FormInput label="Valor em ecocoins" name="price" inputMode="decimal" pattern="[0-9]+([.,][0-9]{1,2})?" required />
        <FormInput label="Estoque inicial" name="quantity" type="number" min="0" max="2147483647" required />
      </div>
      {error && <p role="alert">{error}</p>}
      {saved && <p role="status">Item cadastrado.</p>}
      <button className={action} disabled={busy}>{busy ? "Cadastrando..." : "Cadastrar"}</button>
    </form>
  );
}

export function Inventory() {
  const [query, setQuery] = useState({ search: "", barcode: "", stock: "" });
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const params = new URLSearchParams({ page: String(page) });
  for (const [key, value] of Object.entries(query)) if (value) params.set(key, value);
  const result = useApiResource<InventoryData>(productUrl + "?" + params, refresh);

  async function update(event: FormEvent<HTMLFormElement>, product: Product) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const quantity = Number(new FormData(event.currentTarget).get("quantity"));
    try {
      await http.patch(productUrl + "/" + product.id + "/stock", { quantity, expectedQuantity: product.quantity });
      setRefresh(refresh + 1);
    } catch (error) {
      setError(apiError(error, "Não foi possível atualizar o estoque."));
    } finally {
      setBusy(false);
    }
  }

  async function download() {
    setError("");
    try {
      const { data } = await http.get<Blob>("store/admin/export.xlsx", { responseType: "blob" });
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = "loja-municipal.xlsx";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setError(apiError(error, "Não foi possível exportar o estoque."));
    }
  }

  return (
    <section className={card}>
      <h3 className="text-xl font-bold">Estoque municipal</h3>
      <form className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4" onSubmit={(event) => {
        event.preventDefault();
        const values = new FormData(event.currentTarget);
        setQuery({ search: String(values.get("search")).trim(), barcode: String(values.get("barcode")).trim(), stock: String(values.get("stock")) });
        setPage(1);
        setRefresh(refresh + 1);
      }}>
        <FormInput label="Nome ou descrição" name="search" maxLength={120} />
        <FormInput label="Código de barras" name="barcode" />
        <label className="text-sm">Estoque
          <select name="stock" className="block w-full rounded-lg border border-slate-400 p-2">
            <option value="">Todos</option><option value="available">Disponíveis</option><option value="out">Sem estoque</option>
          </select>
        </label>
        <button className={action} disabled={busy}>Filtrar</button>
      </form>
      <button type="button" className={action} onClick={download}>Exportar para Excel</button>
      {error && <p role="alert">{error}</p>}
      {!result?.data ? <ResourceStatus error={result?.error} /> : (
        <>
          {!result.data.products.length && <p>Nenhum item encontrado.</p>}
          {result.data.products.map((product) => (
            <form key={product.id} onSubmit={(event) => void update(event, product)} className="grid items-end gap-3 border-t border-slate-200 pt-4 sm:grid-cols-[1fr_150px_auto]">
              <div><strong>{product.name}</strong><p className="text-sm">{coins(product.price)} ecocoins · {product.quantity} un.</p></div>
              <FormInput label="Novo estoque" id={"stock-" + product.id} name="quantity" type="number" min="0" max="2147483647" defaultValue={product.quantity} required />
              <button className={action} disabled={busy}>Atualizar</button>
            </form>
          ))}
          <nav aria-label="Paginação do estoque" className="flex items-center gap-3">
            <button className={action} disabled={page === 1 || busy} onClick={() => setPage(page - 1)}>Anterior</button>
            <span>Página {page}</span>
            <button className={action} disabled={page >= result.data.pagination.totalPages || busy} onClick={() => setPage(page + 1)}>Próxima</button>
          </nav>
        </>
      )}
    </section>
  );
}

export function ValidatePickup() {
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ error: boolean; message: string } | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const code = String(new FormData(form).get("code")).trim();
    if (!code) return;
    setBusy(true);
    setFeedback(null);
    try {
      const { data } = await http.post<{ redemption: { id: string; product: { name: string } } }>("store/admin/redemptions/validate", { code });
      setFeedback({ error: false, message: "Retirada confirmada para " + data.redemption.product.name + ". Protocolo " + data.redemption.id });
      form.reset();
    } catch (error) {
      setFeedback({ error: true, message: apiError(error, "Não foi possível confirmar a retirada.") });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={card} onSubmit={submit}>
      <h3 className="text-xl font-bold">Confirmar retirada</h3>
      <FormInput label="Código de retirada" name="code" required />
      {feedback && <p role={feedback.error ? "alert" : "status"}>{feedback.message}</p>}
      <button className={action} disabled={busy}>{busy ? "Confirmando..." : "Confirmar retirada"}</button>
    </form>
  );
}
