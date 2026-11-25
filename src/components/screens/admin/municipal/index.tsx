"use client";

import { isAxiosError } from "axios";
import { useState, type FormEvent } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, PackageCheck, Plus, UserRound } from "lucide-react";
import { apiError, http } from "@/app/service/api/http";
import { useApiResource } from "@/app/service/api/use-api-resource";
import { FormInput } from "@/components/ui/form-input";
import { useGlobalModalStore } from "@/stores/useGlobalModalStore";
import { decimalValueMask } from "@/utils/input-masks";

export type Product = {
  id: string; name: string; description: string; price: string; quantity: number; barcode: string | null;
  photo?: string; active?: boolean;
};
export type InventoryData = { products: Product[]; pagination: { totalPages: number } };
export const productUrl = "store/admin/products";
export const card = "space-y-4 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900";
export const action = "rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50";
export const coins = (value: string | number) => Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
const productPricePattern = "[0-9]{1,10}([.,][0-9]{1,2})?";
const productBarcodePattern = /^[0-9A-Za-z.-]{1,64}$/;

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
              {data.recentOrders.slice(0, 3).map(({ id, user, collectedAt, items }) => (
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
              {data.topItems.slice(0, 3).map(({ productId, productName, units, sharePercent }) => (
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

const photoFormats = "JPG, PNG, WebP, HEIC ou HEIF";
const photoAccept = ".jpg,.jpeg,.png,.webp,.heic,.heif,image/jpeg,image/png,image/webp,image/heic,image/heif";
const maxPhotoSizeMb = 50;
const maxPhotoSize = maxPhotoSizeMb * 1024 * 1024;
const maxPhotoLength = 90_000;
const photoRequirements = `Selecione uma imagem ${photoFormats} de até ${maxPhotoSizeMb} MB.`;

function isSupportedProductPhoto(file: File) {
  const hasSupportedType = photoAccept.split(",").includes(file.type);
  return (hasSupportedType || /\.(jpe?g|png|webp|hei[cf])$/i.test(file.name)) && file.size > 0 && file.size <= maxPhotoSize;
}

async function encodeProductPhoto(file: File) {
  if (!isSupportedProductPhoto(file)) {
    throw new Error(photoRequirements);
  }
  const url = URL.createObjectURL(file);
  const image = new Image();
  try {
    image.src = url;
    await image.decode().catch(() => {
      if (/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name)) {
        throw new Error("Este navegador não conseguiu abrir a foto HEIC ou HEIF. Abra o cadastro no Safari do iPhone ou selecione uma cópia em JPG.");
      }
      throw new Error("Não foi possível abrir essa imagem. Selecione outro arquivo.");
    });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Não foi possível preparar a foto neste navegador.");
    const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
    const initialSize = Math.min(960, longestSide);
    const smallerSizes = [800, 640, 512, 400, 320, 240, 160].filter((size) => size < initialSize);
    for (const size of [initialSize, ...smallerSizes]) {
      const scale = size / longestSide;
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.94, 0.88, 0.82, 0.76]) {
        const photo = canvas.toDataURL("image/webp", quality);
        if (photo.length <= maxPhotoLength) return photo;
      }
    }
  } finally {
    URL.revokeObjectURL(url);
  }
  throw new Error("A foto excede o limite do cadastro. Tente uma imagem mais simples.");
}

function CreateProduct({ onCreated }: { onCreated: () => void }) {
  const [busy, setBusy] = useState(false);
  const [requiredReady, setRequiredReady] = useState(false);
  const [valid, setValid] = useState(false);
  const [photoName, setPhotoName] = useState("");
  const showError = useGlobalModalStore((state) => state.showError);
  const showSuccess = useGlobalModalStore((state) => state.showSuccess);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !valid) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const name = String(values.get("name") ?? "").trim();
    const description = String(values.get("description") ?? "").trim();
    const barcode = String(values.get("barcode") ?? "").trim();
    if (!name || !description) {
      showError("Informe o nome e a descrição do item.");
      return;
    }
    if (barcode && !productBarcodePattern.test(barcode)) {
      showError("O código de barras aceita até 64 letras, números, pontos ou hífens.");
      return;
    }
    setBusy(true);
    let photo: string;
    try {
      const file = values.get("photo");
      if (!(file instanceof File) || file.size === 0) throw new Error("Selecione a foto do item.");
      photo = await encodeProductPhoto(file);
    } catch (error) {
      showError(error instanceof Error ? error.message : "Não foi possível preparar a foto.");
      setBusy(false);
      return;
    }
    try {
      await http.post(productUrl, {
        name, description, photo,
        barcode: barcode || undefined,
        price: values.get("price"), quantity: Number(values.get("quantity")),
      });
      onCreated();
      showSuccess("Item cadastrado com sucesso.");
    } catch (error) {
      showError(apiError(error, "Não foi possível cadastrar o item."));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className={card} onSubmit={submit} onChange={(event) => {
      const form = event.currentTarget;
      const values = new FormData(form);
      const barcode = form.querySelector<HTMLInputElement>('input[name="barcode"]')?.value.trim() ?? "";
      const photo = values.get("photo");
      const requiredFieldsValid = form.matches(":valid") && Boolean(String(values.get("name") ?? "").trim()) &&
        Boolean(String(values.get("description") ?? "").trim()) && photo instanceof File && isSupportedProductPhoto(photo);
      setRequiredReady(requiredFieldsValid);
      setValid(requiredFieldsValid && (!barcode || productBarcodePattern.test(barcode)));
    }} onInvalid={(event) => {
      event.preventDefault();
      const field = event.target as HTMLInputElement;
      if (field !== event.currentTarget.querySelector("input:invalid")) return;
      const label = field.labels?.[0]?.textContent?.trim();
      showError(field.name === "photo" ? "Selecione a foto do item." :
        [label, field.validationMessage].filter(Boolean).join(" · "));
    }}>
      <h3 className="text-xl font-bold">Cadastrar item</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput label="Nome" name="name" required maxLength={120} />
        <FormInput label="Descrição" name="description" required maxLength={2000} />
        <FormInput label="Valor em ecocoins" name="price" inputMode="decimal" pattern={productPricePattern} required
          onChange={(event) => { event.currentTarget.value = decimalValueMask(event.currentTarget.value); }} />
        <FormInput label="Estoque inicial" name="quantity" type="number" min="0" max="2147483647" required />
        <div className="sm:col-span-2">
          <label htmlFor="product-photo" className="relative flex cursor-pointer flex-wrap items-center gap-3 rounded-2xl border border-dashed border-emerald-500 bg-emerald-50 p-4 text-slate-900 hover:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-500 dark:bg-slate-800">
            <ImagePlus size={23} aria-hidden="true" className="text-emerald-700 dark:text-emerald-300" />
            <span className="min-w-0 space-y-1">
              <strong className="block text-sm">{photoName ? "Trocar foto do item" : "Selecionar foto do item"}</strong>
              <span className="block break-all text-xs text-slate-600">{photoName || `${photoFormats} até ${maxPhotoSizeMb} MB.`}</span>
            </span>
            <input id="product-photo" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" type="file" name="photo"
              accept={photoAccept} required disabled={busy}
              onChange={(event) => {
                const photo = event.target.files?.[0];
                if (photo && !isSupportedProductPhoto(photo)) {
                  event.target.value = "";
                  showError(photoRequirements);
                }
                setPhotoName(event.target.files?.[0]?.name ?? "");
              }} />
          </label>
        </div>
        <div className="sm:col-span-2">
          <FormInput label="Código de barras" name="barcode" maxLength={64} autoComplete="off"
            disabled={busy || !requiredReady}
            helpText={requiredReady ? "Opcional. Escaneie ou digite o código e depois clique em Cadastrar." : "Preencha os outros campos para liberar a leitura."}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.preventDefault();
            }} />
        </div>
      </div>
      <button type="submit" className={action} disabled={busy || !valid}>{busy ? "Cadastrando..." : "Cadastrar"}</button>
    </form>
  );
}

export function Inventory() {
  const [creating, setCreating] = useState(false);

  if (creating) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <button type="button" onClick={() => setCreating(false)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:underline dark:text-emerald-300">
          <ChevronLeft size={16} aria-hidden="true" /> Voltar ao estoque
        </button>
        <CreateProduct onCreated={() => setCreating(false)} />
      </div>
    );
  }

  return <InventoryList onCreate={() => setCreating(true)} />;
}

function InventoryList({ onCreate }: { onCreate: () => void }) {
  const [query, setQuery] = useState({ search: "", barcode: "", stock: "" });
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const params = new URLSearchParams({ page: String(page) });
  for (const [key, value] of Object.entries(query)) if (value) params.set(key, value);
  const result = useApiResource<InventoryData>(productUrl + "?" + params, refresh);
  const showError = useGlobalModalStore((state) => state.showError);

  async function toggleProduct(product: Product) {
    if (busy) return;
    const active = product.active === false;
    setBusy(true);
    setError("");
    try {
      await http.patch(productUrl + "/" + product.id + "/status", { active });
      if (query.stock === "available" && result?.data?.products.length === 1 && page > 1) {
        setPage(page - 1);
      }
      setRefresh((value) => value + 1);
    } catch (error) {
      showError(apiError(error, "Não foi possível alterar a disponibilidade do item."));
    } finally {
      setBusy(false);
    }
  }

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
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-bold">Estoque municipal</h3>
          <button type="button" onClick={onCreate} disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
            <Plus size={15} aria-hidden="true" /> Cadastrar item
          </button>
        </header>
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
              <InventoryRow key={product.id} product={product} busy={busy}
                onUpdate={update} onToggle={toggleProduct} />
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

function InventoryRow({ product, busy, onUpdate, onToggle }: {
  product: Product;
  busy: boolean;
  onUpdate: (event: FormEvent<HTMLFormElement>, product: Product) => Promise<void>;
  onToggle: (product: Product) => Promise<void>;
}) {
  const [valid, setValid] = useState(true);
  const inactive = product.active === false;

  return (
    <form onSubmit={(event) => void onUpdate(event, product)}
      onChange={(event) => setValid(event.currentTarget.matches(":valid"))}
      className={`grid grid-cols-2 items-end gap-3 border-t border-slate-200 pt-4 transition-opacity xl:grid-cols-[minmax(0,1fr)_minmax(8rem,10rem)_minmax(7rem,9rem)_auto] ${inactive ? "opacity-60" : ""}`}>
      <div className="col-span-2 flex items-center gap-3 xl:col-span-1">
        <div className="min-w-0">
          <strong>{product.name}</strong>
          <p className="text-sm text-slate-600">{coins(product.price)} ecocoins · {product.quantity} un.</p>
        </div>
        <button type="button" role="switch" aria-checked={!inactive} aria-label={"Disponibilidade de " + product.name}
          title={inactive ? "Inativo" : "Ativo"} disabled={busy} onClick={() => void onToggle(product)}
          className={`relative h-5 w-9 shrink-0 rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-50 ${inactive ? "bg-slate-500" : "bg-emerald-700"}`}>
          <span aria-hidden="true" className={`absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow transition-transform ${inactive ? "" : "translate-x-4"}`} />
        </button>
      </div>
      <FormInput label="Preço em ecocoins" id={"price-" + product.id} name="price" inputMode="decimal"
        pattern={productPricePattern} defaultValue={product.price.replace(".", ",")} required disabled={busy}
        onChange={(event) => { event.currentTarget.value = decimalValueMask(event.currentTarget.value); }} />
      <FormInput label="Novo estoque" id={"stock-" + product.id} name="quantity" type="number" min="0" max="2147483647"
        defaultValue={product.quantity} required disabled={busy} />
      <button className={action + " col-span-2 justify-self-end xl:col-span-1"} disabled={busy || !valid}>Atualizar</button>
    </form>
  );
}

export function ValidatePickup() {
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState<{ error: boolean; message: string } | null>(null);
  const valid = /^[A-F0-9]{12}$/i.test(code.trim());
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !valid) return;
    setBusy(true);
    setFeedback(null);
    try {
      const { data } = await http.post<{ redemption: { id: string; product: { name: string } } }>("store/admin/redemptions/validate", { code: code.trim() });
      setFeedback({ error: false, message: "Retirada confirmada para " + data.redemption.product.name + ". Protocolo " + data.redemption.id });
      setCode("");
    } catch (error) {
      setFeedback({ error: true, message: apiError(error, "Não foi possível confirmar a retirada.") });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={card} onSubmit={submit}>
      <h3 className="text-xl font-bold">Confirmar retirada</h3>
      <FormInput label="Código de retirada" name="code" required value={code} onChange={(event) => setCode(event.target.value)} />
      {feedback && <p role={feedback.error ? "alert" : "status"}>{feedback.message}</p>}
      <button className={action} disabled={busy || !valid}>{busy ? "Confirmando..." : "Confirmar retirada"}</button>
    </form>
  );
}
