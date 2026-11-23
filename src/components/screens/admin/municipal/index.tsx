"use client";

import { isAxiosError } from "axios";
import { useState, type FormEvent } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, PackageCheck, UserRound } from "lucide-react";
import { apiError, http } from "@/app/service/api/http";
import { useApiResource } from "@/app/service/api/use-api-resource";
import { FormInput } from "@/components/ui/form-input";

export type Product = {
  id: string; name: string; description: string; price: string; quantity: number; barcode: string | null;
  photo?: string;
};
export type InventoryData = { products: Product[]; pagination: { totalPages: number } };
export const productUrl = "store/admin/products";
export const card = "space-y-4 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900";
export const action = "rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50";
export const coins = (value: string | number) => Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
const productPricePattern = "[0-9]{1,10}([.,][0-9]{1,2})?";

export function ResourceStatus({ error }: { error?: string }) {
  return error ? <p role="alert" className="text-red-700">{error}</p> : <p role="status">Carregando...</p>;
}

type Dashboard = {
  ordersCollected: number; usersServed: number; pointsRedeemed: string;
  recentOrders: { id: string; user: { name: string | null }; collectedAt: string; items: { productId: string; name: string; quantity: number }[] }[];
  topItems: { productId: string; productName: string; units: number; sharePercent: number }[];
};
const orderDate = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit", month: "short", year: "numeric",
  hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo",
});

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
      <div className="grid items-start gap-6 md:grid-cols-2">
        <section className={card}>
          <h3 className="flex items-center gap-2.5 text-xl font-bold">
            <PackageCheck size={22} aria-hidden="true" className="shrink-0 text-emerald-700 dark:text-emerald-300" />
            Pedidos recentes
          </h3>
          {data.recentOrders.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-600">Nenhum pedido coletado.</p>
          ) : (
            <ul className="space-y-3">
              {data.recentOrders.map(({ id, user, collectedAt, items }) => (
                <li key={id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                    <p className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                      <UserRound size={16} aria-hidden="true" className="shrink-0 text-slate-500" />
                      <span className="break-words">{user.name || "Munícipe"}</span>
                    </p>
                    <time dateTime={collectedAt} className="text-xs text-slate-600">{orderDate.format(new Date(collectedAt))}</time>
                  </div>
                  <ul aria-label="Itens retirados" className="mt-3 flex flex-wrap gap-2 border-t border-slate-200 pt-3">
                    {items.map(({ productId, name, quantity }) => (
                      <li key={productId} className="inline-flex min-w-0 items-center gap-2 rounded-lg bg-white px-2.5 py-1 text-xs text-slate-700">
                        <span className="shrink-0 font-bold text-emerald-800 dark:text-emerald-300">{quantity} ×</span>
                        <span className="break-words">{name}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className={card}>
          <h3 className="text-xl font-bold">Itens mais retirados</h3>
          {!data.topItems.length && <p>Nenhum item retirado.</p>}
          {!!data.topItems.length && (
            <ol className="space-y-4">
              {data.topItems.map(({ productId, productName, units, sharePercent }) => (
                <li key={productId}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
                    <strong>{productName}</strong>
                    <span className="text-slate-600">{units} un. · {coins(sharePercent)}%</span>
                  </div>
                  <div aria-hidden="true" className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-full rounded-full bg-emerald-600 dark:bg-emerald-400" style={{ width: `${sharePercent}%` }} />
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}

const photoTypes = ["image/jpeg", "image/png", "image/webp"];
const maxPhotoSize = 10 * 1024 * 1024;
const maxPhotoLength = 2048;

async function encodeProductPhoto(file: File) {
  if (!photoTypes.includes(file.type) || file.size > maxPhotoSize) {
    throw new Error("Selecione uma imagem JPG, PNG ou WebP de até 10 MB.");
  }
  const image = await createImageBitmap(file).catch(() => {
    throw new Error("Não foi possível abrir essa imagem. Selecione outro arquivo.");
  });
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Não foi possível preparar a foto neste navegador.");
    // A API armazena a imagem no campo photo, limitado a 2.048 caracteres.
    for (const size of [160, 128, 96, 72, 48, 32]) {
      const scale = Math.min(1, size / Math.max(image.width, image.height));
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.7, 0.45, 0.25]) {
        const photo = canvas.toDataURL("image/webp", quality);
        if (photo.length <= maxPhotoLength) return photo;
      }
    }
  } finally {
    image.close();
  }
  throw new Error("A foto excede o limite do cadastro. Tente uma imagem mais simples.");
}

export function CreateProduct() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [photoName, setPhotoName] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setBusy(true);
    setError("");
    setSaved(false);
    let photo: string;
    try {
      const file = values.get("photo");
      if (!(file instanceof File) || file.size === 0) throw new Error("Selecione a foto do item.");
      photo = await encodeProductPhoto(file);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Não foi possível preparar a foto.");
      setBusy(false);
      return;
    }
    try {
      await http.post(productUrl, {
        name: values.get("name"), description: values.get("description"), photo,
        barcode: String(values.get("barcode")).trim() || undefined,
        price: values.get("price"), quantity: Number(values.get("quantity")),
      });
      form.reset();
      setPhotoName("");
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
        <FormInput label="Código de barras" name="barcode" />
        <FormInput label="Valor em ecocoins" name="price" inputMode="decimal" pattern={productPricePattern} required />
        <FormInput label="Estoque inicial" name="quantity" type="number" min="0" max="2147483647" required />
        <div className="sm:col-span-2">
          <label htmlFor="product-photo" className="relative flex cursor-pointer flex-wrap items-center gap-3 rounded-2xl border border-dashed border-emerald-500 bg-emerald-50 p-4 text-slate-900 hover:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-500 dark:bg-slate-800">
            <ImagePlus size={23} aria-hidden="true" className="text-emerald-700 dark:text-emerald-300" />
            <span className="min-w-0 space-y-1">
              <strong className="block text-sm">{photoName ? "Trocar foto do item" : "Selecionar foto do item"}</strong>
              <span className="block break-all text-xs text-slate-600">{photoName || "JPG, PNG ou WebP até 10 MB. A foto será salva como miniatura."}</span>
            </span>
            <input id="product-photo" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" type="file" name="photo"
              accept={photoTypes.join(",")} required disabled={busy}
              onChange={(event) => {
                setPhotoName(event.target.files?.[0]?.name ?? "");
                setError("");
              }} />
          </label>
        </div>
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
    const values = new FormData(event.currentTarget);
    const quantity = Number(values.get("quantity"));
    const price = String(values.get("price")).trim().replace(",", ".");
    try {
      await http.patch(productUrl + "/" + product.id + "/stock", {
        quantity, expectedQuantity: product.quantity, price, expectedPrice: product.price,
      });
      setRefresh(refresh + 1);
    } catch (error) {
      setError(apiError(error, "Não foi possível atualizar o preço e o estoque."));
      if (isAxiosError(error) && error.response?.status === 409) setRefresh(refresh + 1);
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
    <div className="space-y-4">
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
            <select name="stock" className="block w-full rounded-lg border border-slate-400 bg-white p-2 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:[color-scheme:dark] [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-slate-900 dark:[&>option]:text-slate-100">
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
              <form key={product.id} onSubmit={(event) => void update(event, product)} className="grid grid-cols-2 items-end gap-3 border-t border-slate-200 pt-4 xl:grid-cols-[minmax(0,1fr)_minmax(8rem,10rem)_minmax(7rem,9rem)_auto]">
                <div className="col-span-2 xl:col-span-1"><strong>{product.name}</strong><p className="text-sm text-slate-600">{coins(product.price)} ecocoins · {product.quantity} un.</p></div>
                <FormInput label="Preço em ecocoins" id={"price-" + product.id} name="price" inputMode="decimal"
                  pattern={productPricePattern} defaultValue={product.price.replace(".", ",")} required disabled={busy} />
                <FormInput label="Novo estoque" id={"stock-" + product.id} name="quantity" type="number" min="0" max="2147483647" defaultValue={product.quantity} required disabled={busy} />
                <button className={action + " col-span-2 justify-self-end xl:col-span-1"} disabled={busy}>Atualizar</button>
              </form>
            ))}
          </>
        )}
      </section>
      <nav aria-label="Paginação do estoque" className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <button type="button" className={action + " flex items-center gap-1 justify-self-start max-sm:px-2"} disabled={page === 1 || busy || !result} onClick={() => setPage(page - 1)}>
          <ChevronLeft size={16} aria-hidden="true" />Anterior
        </button>
        <span className="text-center text-sm" aria-live="polite">Página {page}</span>
        <button type="button" className={action + " flex items-center gap-1 justify-self-end max-sm:px-2"} disabled={!result?.data || page >= result.data.pagination.totalPages || busy} onClick={() => setPage(page + 1)}>
          Próxima<ChevronRight size={16} aria-hidden="true" />
        </button>
      </nav>
    </div>
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
