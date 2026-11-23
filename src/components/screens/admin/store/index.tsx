"use client";

import { isAxiosError } from "axios";
import { useRef, useState, type FormEvent } from "react";
import { apiError, http } from "@/app/service/api/http";
import { useApiResource } from "@/app/service/api/use-api-resource";
import { FormInput } from "@/components/ui/form-input";
import { inputMasks } from "@/utils/input-masks";
import { isValidCpf } from "@/validation/citizen-registration";
import { action, card, coins, ResourceStatus, type Product } from "../municipal";
import { ProductCarousel } from "./product-carousel";

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
  const [refresh, setRefresh] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inFlight = useRef(false);
  const carts = useApiResource<{ carts: Cart[] }>(cartsUrl, refresh);

  async function perform(operation: () => Promise<void>, onError?: (error: unknown) => void) {
    if (inFlight.current) return false;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      await operation();
      return true;
    } catch (error) {
      onError?.(error);
      setError(apiError(error, "Não foi possível concluir a operação. Verifique a conexão e tente novamente."));
      return false;
    } finally {
      inFlight.current = false;
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

  async function updateItem(product: Product, quantity: number) {
    if (!cart || checkoutUnconfirmed) return false;
    return perform(async () => {
      const { data } = await http.put<Cart>(cartsUrl + "/" + cart.id + "/items", {
        productId: product.id, quantity,
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
      setRefresh(refresh + 1);
    }, (error) => {
      if (isAxiosError(error) && error.response && error.response.status < 500) setCheckoutUnconfirmed(false);
    });
  }

  return (
    <section className="space-y-6">
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/45 dark:text-red-300">{error}</p>}
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
                <div className="flex items-center gap-3">
                  <button type="button" className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-50" aria-label={"Diminuir quantidade de " + item.product.name} disabled={busy || checkoutUnconfirmed || item.quantity <= 1} onClick={() => void updateItem(item.product, item.quantity - 1)}>−</button>
                  <button type="button" className="text-sm underline disabled:opacity-50" disabled={busy || checkoutUnconfirmed} onClick={() => void updateItem(item.product, 0)}>Remover</button>
                </div>
              </li>
            ))}
          </ul>
          <ProductCarousel
            disabled={busy || checkoutUnconfirmed}
            quantityInCart={(id) => cart.items.find((item) => item.productId === id)?.quantity ?? 0}
            onAdd={(product) => updateItem(product, (cart.items.find((item) => item.productId === product.id)?.quantity ?? 0) + 1)}
          />
          <p className="font-semibold">Total de {coins(cart.items.reduce((total, item) => total + Number(item.product.price) * item.quantity, 0))} ecocoins</p>
          <div className="flex flex-wrap items-center gap-4">
            <button type="button" className={action} disabled={busy || !cart.items.length} onClick={checkout}>
              {checkoutUnconfirmed ? "Confirmar resultado da venda" : "Finalizar venda"}
            </button>
            <button type="button" className="text-sm underline disabled:opacity-50" disabled={busy || checkoutUnconfirmed} onClick={() => {
              setCheckoutUnconfirmed(false);
              setCart(null);
              setRefresh(refresh + 1);
              setError("");
            }}>Voltar aos carrinhos</button>
            <button type="button" className="text-sm underline disabled:opacity-50" disabled={busy || checkoutUnconfirmed} onClick={() => void perform(async () => {
              await http.delete(cartsUrl + "/" + cart.id);
              setCart(null);
              setRefresh(refresh + 1);
            })}>Cancelar carrinho</button>
          </div>
        </div>
      )}
    </section>
  );
}
