"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Package, Plus, ScanBarcode, Search } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { apiError, http } from "@/app/service/api/http";
import { action, coins, productUrl, type InventoryData, type Product } from "../municipal";

type Props = {
  disabled: boolean;
  quantityInCart: (productId: string) => number;
  onAdd: (product: Product) => Promise<boolean>;
};

const barcodePattern = /^[0-9A-Za-z.-]{1,64}$/;

function getProducts(search: string, page: number, signal: AbortSignal, barcode?: string) {
  const params = new URLSearchParams({ stock: "available", page: String(page) });
  if (barcode) params.set("barcode", barcode);
  else if (search) params.set("search", search);
  return http.get<InventoryData>(productUrl + "?" + params, { signal });
}

export function ProductCarousel({ disabled, quantityInCart, onAdd }: Props) {
  const [search, setSearch] = useState("");
  const [result, setResult] = useState<{ query: string; products: Product[]; page: number; total: number }>();
  const [error, setError] = useState("");
  const [scanMessage, setScanMessage] = useState("");
  const [scanning, setScanning] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const scanRequest = useRef<AbortController | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const cartActions = useRef({ disabled, quantityInCart, onAdd });
  const query = search.trim();
  const current = result?.query === query ? result : undefined;
  const more = !!current && current.page < current.total;

  useLayoutEffect(() => {
    cartActions.current = { disabled, quantityInCart, onAdd };
  }, [disabled, quantityInCart, onAdd]);

  useEffect(() => () => scanRequest.current?.abort(), []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      getProducts(query, 1, controller.signal).then(({ data }) => {
        if (controller.signal.aborted) return;
        setError("");
        setResult({ query, products: data.products, page: 1, total: data.pagination.totalPages });
        if (track.current) track.current.scrollLeft = 0;
      }).catch((error) => {
        if (!controller.signal.aborted) setError(apiError(error, "Não foi possível consultar os itens."));
      });
    }, query ? 250 : 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    if (!more || !current || !track.current || !end.current) return;
    const controller = new AbortController();
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      setLoadingMore(true);
      getProducts(query, current.page + 1, controller.signal).then(({ data }) => {
        if (controller.signal.aborted) return;
        const known = new Set(current.products.map(({ id }) => id));
        setResult({ query, products: [...current.products, ...data.products.filter(({ id }) => !known.has(id))], page: current.page + 1, total: data.pagination.totalPages });
      }).catch((error) => {
        if (!controller.signal.aborted) setError(apiError(error, "Não foi possível carregar mais itens."));
      }).finally(() => {
        if (!controller.signal.aborted) setLoadingMore(false);
      });
    }, { root: track.current, rootMargin: "0px 96px" });
    observer.observe(end.current);
    return () => {
      observer.disconnect();
      controller.abort();
    };
  }, [current, more, query]);

  async function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled || scanRequest.current || !barcodePattern.test(query)) return;
    const controller = new AbortController();
    scanRequest.current = controller;
    setScanning(true);
    setScanMessage("");
    try {
      const { data } = await getProducts("", 1, controller.signal, query);
      if (controller.signal.aborted || cartActions.current.disabled) return;
      const product = data.products.find(({ barcode }) => barcode === query);
      if (!product) {
        if (/^[0-9]+$/.test(query)) setScanMessage("Código de barras não encontrado no estoque disponível.");
        return;
      }
      if (cartActions.current.quantityInCart(product.id) >= product.quantity) {
        setScanMessage("Todas as unidades disponíveis deste item já estão no carrinho.");
        return;
      }
      if (await cartActions.current.onAdd(product) && !controller.signal.aborted) {
        setSearch("");
        setLoadingMore(false);
      }
    } catch (error) {
      if (!controller.signal.aborted) setScanMessage(apiError(error, "Não foi possível consultar o código de barras."));
    } finally {
      scanRequest.current = null;
      if (!controller.signal.aborted) {
        setScanning(false);
        input.current?.focus();
      }
    }
  }

  function scroll(direction: number) {
    track.current?.scrollBy({ left: direction * track.current.clientWidth * 0.8 });
  }

  return (
    <section aria-labelledby="sale-catalog-heading" className="space-y-4 border-y border-slate-200 py-5">
      <div className="flex items-center justify-between gap-3">
        <h4 id="sale-catalog-heading" className="font-bold">Produtos em estoque</h4>
        <div className="flex gap-2">
          <button type="button" aria-label="Rolar produtos para a esquerda" onClick={() => scroll(-1)} className="rounded-lg border border-slate-200 p-2"><ChevronLeft size={18} aria-hidden="true" /></button>
          <button type="button" aria-label="Rolar produtos para a direita" onClick={() => scroll(1)} className="rounded-lg border border-slate-200 p-2"><ChevronRight size={18} aria-hidden="true" /></button>
        </div>
      </div>
      <form onSubmit={submitSearch} className="space-y-2">
        <label htmlFor="sale-product-search" className="block text-sm font-semibold">Buscar produto</label>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:ring-2 focus-within:ring-emerald-500 dark:bg-slate-800">
          <Search size={18} className="shrink-0 text-slate-500" aria-hidden="true" />
          <input id="sale-product-search" ref={input} type="search" value={search} maxLength={120} autoComplete="off"
            placeholder="Nome ou código de barras" aria-describedby="sale-search-help" readOnly={disabled || scanning}
            onChange={(event) => {
              setSearch(event.target.value);
              setError("");
              setScanMessage("");
              setLoadingMore(false);
            }}
            className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" />
          <button type="submit" aria-label="Adicionar pelo código de barras" disabled={!query || disabled || scanning} className="rounded-lg p-2 text-emerald-800 disabled:opacity-50 dark:text-emerald-300">
            <ScanBarcode size={20} aria-hidden="true" />
          </button>
        </div>
        <p id="sale-search-help" className="text-xs text-slate-600">Leia ou digite o código e pressione Enter para adicionar uma unidade.</p>
      </form>
      {scanMessage && <p role="status" className="text-sm">{scanMessage}</p>}
      {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
      {!current && !error && <p role="status" className="text-sm">Buscando produtos...</p>}
      {current && !current.products.length && <p className="text-sm text-slate-600">Nenhum produto encontrado.</p>}
      {!!current?.products.length && (
        <div ref={track} tabIndex={0} aria-label="Carrossel de produtos" className="flex snap-x gap-4 overflow-x-auto scroll-smooth pb-3 motion-reduce:scroll-auto">
          {current.products.map((product) => {
            const remaining = product.quantity - quantityInCart(product.id);
            return (
              <article key={product.id} className="flex w-52 shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white sm:w-60">
                <ProductPhoto photo={product.photo} />
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex-1 space-y-1">
                    <h5 className="break-words text-sm font-bold">{product.name}</h5>
                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">{coins(product.price)} ecocoins</p>
                    <p className="text-xs text-slate-600">{Math.max(0, remaining)} disponíveis para adicionar</p>
                    {product.barcode && <p className="break-all text-xs text-slate-600">Código {product.barcode}</p>}
                  </div>
                  <button type="button" disabled={disabled || scanning || remaining <= 0} onClick={() => void onAdd(product)}
                    aria-label={"Adicionar " + product.name} className={action + " inline-flex items-center justify-center gap-1.5"}>
                    <Plus size={16} aria-hidden="true" />Adicionar
                  </button>
                </div>
              </article>
            );
          })}
          {more && <div ref={end} aria-hidden="true" className="w-px shrink-0" />}
        </div>
      )}
      {loadingMore && <p role="status" className="text-sm">Carregando mais produtos...</p>}
    </section>
  );
}

function ProductPhoto({ photo }: { photo?: string }) {
  const [failedPhoto, setFailedPhoto] = useState<string>();
  const supported = photo && /^(https?:\/\/|\/(?!\/)|data:image\/(jpeg|png|webp);base64,)/i.test(photo);

  return (
    <div className="relative grid aspect-[4/3] place-items-center overflow-hidden border-b border-slate-200 bg-slate-50 text-slate-500 dark:bg-slate-800">
      {supported && failedPhoto !== photo ? (
        <Image src={photo} alt="" fill unoptimized sizes="(min-width: 640px) 240px, 208px" className="object-contain p-2" onError={() => setFailedPhoto(photo)} />
      ) : <Package size={34} aria-hidden="true" />}
    </div>
  );
}
