"use client";

import { isAxiosError } from "axios";
import { useState, type FormEvent } from "react";
import { apiError, http } from "@/app/service/api/http";
import { useApiResource } from "@/app/service/api/use-api-resource";
import { FormInput } from "@/components/ui/form-input";
import { inputMasks } from "@/utils/input-masks";
import { isValidCpf } from "@/validation/citizen-registration";
import { action, card, coins, productUrl, ResourceStatus, type InventoryData, type Product } from "../municipal";

type Buyer = { id: string; ecoCoinBalance: string; pendingActivation: boolean };
type Cart = { id: string; buyerId: string; expiresAt: string; items: { productId: string; quantity: number; product: Product }[] };
type Receipt = { saleId: string; total: string; ecoCoinBalance: string };
const cartsUrl = "store/admin/carts";

export function AdminStore() {
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [cpf, setCpf] = useState("");
  const [cart, setCart] = useState<Cart | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [checkoutUnconfirmed, setCheckoutUnconfirmed] = useState(false);
  const [page, setPage] = useState(1);
  const [productId, setProductId] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inventory = useApiResource<InventoryData>(productUrl + "?stock=available&page=" + page, refresh);
  const carts = useApiResource<{ carts: Cart[] }>(cartsUrl, refresh);

  async function perform(operation: () => Promise<void>, onError?: (error: unknown) => void) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await operation();
    } catch (error) {
      onError?.(error);
      setError(apiError(error, "Não foi possível concluir a operação. Verifique a conexão e tente novamente."));
    } finally {
      setBusy(false);
    }
  }

  function lookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBuyer(null);
    setReceipt(null);
    if (!isValidCpf(cpf)) {
      setError("Informe um CPF válido.");
      return;
    }
    void perform(async () => {
      const { data } = await http.post<Buyer>("residents/lookup", { cpf });
      setBuyer(data);
    });
  }

  async function openCart() {
    if (!buyer) return;
    await perform(async () => {
      const { data } = await http.post<Cart>(cartsUrl, { buyerId: buyer.id });
      setCart(data);
    });
  }

  function updateItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cart) return;
    const values = new FormData(event.currentTarget);
    const barcode = String(values.get("barcode")).trim();
    const quantity = Number(values.get("quantity"));
    if (Boolean(barcode) === Boolean(productId)) {
      setError("Selecione um item ou informe o código de barras.");
      return;
    }
    void perform(async () => {
      const { data } = await http.put<Cart>(cartsUrl + "/" + cart.id + "/items", {
        ...(barcode ? { barcode } : { productId }), quantity,
      });
      setCart(data);
    });
  }

  async function checkout() {
    if (!cart) return;
    setCheckoutUnconfirmed(true);
    await perform(async () => {
      const { data } = await http.post<Receipt>(cartsUrl + "/" + cart.id + "/checkout");
      setReceipt(data);
      setCheckoutUnconfirmed(false);
      setCart(null);
      setBuyer(null);
      setCpf("");
      setPage(1);
      setProductId("");
      setRefresh(refresh + 1);
    }, (error) => {
      if (isAxiosError(error) && error.response && error.response.status < 500) setCheckoutUnconfirmed(false);
    });
  }

  return (
    <section className="space-y-6">
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {receipt && (
        <div className={card} role="status">
          <h3 className="text-xl font-bold">Venda concluída</h3>
          <p>Protocolo {receipt.saleId}</p>
          <p>{coins(receipt.total)} ecocoins debitados · Saldo restante de {coins(receipt.ecoCoinBalance)} ecocoins</p>
        </div>
      )}
      {!cart ? (
        <>
          <form className={card} onSubmit={lookup}>
            <h3 className="text-xl font-bold">Localizar munícipe</h3>
            <FormInput id="sale-cpf" label="CPF" value={cpf} onChange={(event) => {
              setCpf(inputMasks.cpf(event.target.value));
              setBuyer(null);
            }} inputMode="numeric" placeholder="000.000.000-00" required disabled={busy} />
            <button className={action} disabled={busy}>Consultar</button>
            {buyer && (
              <div className="space-y-2">
                <p>Saldo de {coins(buyer.ecoCoinBalance)} ecocoins{buyer.pendingActivation ? " · Ativação pendente" : ""}</p>
                <button type="button" className={action} disabled={busy} onClick={openCart}>Criar carrinho</button>
              </div>
            )}
          </form>
          <div className={card}>
            <h3 className="text-xl font-bold">Carrinhos em aberto</h3>
            {!carts?.data ? <ResourceStatus error={carts?.error} /> : !carts.data.carts.length ? <p>Nenhum carrinho em aberto.</p> : (
              <ul className="space-y-3">
                {carts.data.carts.map((saved) => (
                  <li key={saved.id}>
                    <button type="button" className={action} disabled={busy} onClick={() => void perform(async () => {
                      const { data } = await http.get<Cart>(cartsUrl + "/" + saved.id);
                      setCart(data);
                      setBuyer(null);
                      setReceipt(null);
                    })}>
                      Retomar {saved.id.slice(0, 8)} · {saved.items.length} item(ns) · Expira em {new Date(saved.expiresAt).toLocaleString("pt-BR")}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : (
        <div className={card}>
          <h3 className="text-xl font-bold">Carrinho {cart.id.slice(0, 8)}</h3>
          {!cart.items.length && <p>Adicione itens ao carrinho.</p>}
          <ul className="space-y-2">
            {cart.items.map((item) => (
              <li key={item.productId} className="flex flex-wrap items-center justify-between gap-3">
                <span>{item.quantity} × {item.product.name} · {coins(Number(item.product.price) * item.quantity)} ecocoins</span>
                <button type="button" className="text-sm underline disabled:opacity-50" disabled={busy || checkoutUnconfirmed} onClick={() => void perform(async () => {
                  const { data } = await http.put<Cart>(cartsUrl + "/" + cart.id + "/items", { productId: item.productId, quantity: 0 });
                  setCart(data);
                })}>Remover</button>
              </li>
            ))}
          </ul>
          <form onSubmit={updateItem} className="space-y-3 border-y border-slate-200 py-4">
            <fieldset disabled={busy || checkoutUnconfirmed} className="space-y-3">
              {inventory?.data ? (
                <>
                  <label className="block text-sm">Item em estoque
                    <select value={productId} onChange={(event) => setProductId(event.target.value)} className="block w-full rounded-lg border border-slate-400 p-2">
                      <option value="">Selecione um item</option>
                      {inventory.data.products.map((product) => <option key={product.id} value={product.id}>{product.name} · {coins(product.price)} ecocoins · {product.quantity} un.</option>)}
                    </select>
                  </label>
                  <div className="flex items-center gap-3 text-sm">
                    <button type="button" disabled={page === 1} onClick={() => { setPage(page - 1); setProductId(""); }}>Anterior</button>
                    <span>Página {page}</span>
                    <button type="button" disabled={page >= inventory.data.pagination.totalPages} onClick={() => { setPage(page + 1); setProductId(""); }}>Próxima</button>
                  </div>
                </>
              ) : <ResourceStatus error={inventory?.error} />}
              <FormInput id="sale-barcode" label="Ou informe o código de barras" name="barcode" />
              <FormInput id="sale-quantity" label="Quantidade total do item" name="quantity" type="number" min="1" max="2147483647" defaultValue="1" required />
              <button className={action}>Atualizar item</button>
            </fieldset>
          </form>
          <p className="font-semibold">Total de {coins(cart.items.reduce((total, item) => total + Number(item.product.price) * item.quantity, 0))} ecocoins</p>
          <div className="flex flex-wrap items-center gap-4">
            <button type="button" className={action} disabled={busy || !cart.items.length} onClick={checkout}>
              {checkoutUnconfirmed ? "Confirmar resultado da venda" : "Finalizar venda"}
            </button>
            <button type="button" className="text-sm underline disabled:opacity-50" disabled={busy || checkoutUnconfirmed} onClick={() => {
              setCheckoutUnconfirmed(false);
              setCart(null);
              setProductId("");
              setRefresh(refresh + 1);
              setError("");
            }}>Voltar aos carrinhos</button>
            <button type="button" className="text-sm underline disabled:opacity-50" disabled={busy || checkoutUnconfirmed} onClick={() => void perform(async () => {
              await http.delete(cartsUrl + "/" + cart.id);
              setCart(null);
              setProductId("");
              setRefresh(refresh + 1);
            })}>Cancelar carrinho</button>
          </div>
        </div>
      )}
    </section>
  );
}
