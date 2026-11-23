"use client";

import { isAxiosError } from "axios";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Wallet } from "lucide-react";
import { apiError, http } from "@/app/service/api/http";
import { useApiResource } from "@/app/service/api/use-api-resource";
import { FormInput } from "@/components/ui/form-input";
import SuccessModal from "@/components/ui/modal/SuccessModal";
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
  const [addedItem, setAddedItem] = useState<{ name: string } | null>(null);
  const [showBalanceLookup, setShowBalanceLookup] = useState(false);
  const inFlight = useRef(false);
  const carts = useApiResource<{ carts: Cart[] }>(cartsUrl, refresh);

  useEffect(() => {
    if (!addedItem) return;
    const timer = setTimeout(() => setAddedItem(null), 3000);
    return () => clearTimeout(timer);
  }, [addedItem]);

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

  async function addItem(product: Product) {
    const quantity = cart?.items.find((item) => item.productId === product.id)?.quantity ?? 0;
    const added = await updateItem(product, quantity + 1);
    if (added) setAddedItem({ name: product.name });
    return added;
  }

  function lookupCartBalance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cart || !isValidCpf(cpf)) {
      setError("Informe um CPF válido.");
      return;
    }
    void perform(async () => {
      const { data } = await http.post<Buyer>("residents/lookup", { cpf });
      if (data.id !== cart.buyerId) {
        setError("Esse CPF não corresponde ao munícipe do carrinho.");
        return;
      }
      setBuyer(data);
      setShowBalanceLookup(false);
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
      <SuccessModal open={!!addedItem} onClose={() => setAddedItem(null)}
        title="Item adicionado ao carrinho" message={addedItem?.name} />
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
                <p>Munícipe localizado{buyer.pendingActivation ? " · Ativação pendente" : ""}</p>
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
                      setCpf("");
                      setShowBalanceLookup(false);
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
          <header className="flex flex-wrap items-start justify-between gap-3">
            <h3 className="pt-2 text-xl font-bold">Carrinho</h3>
            <div className="ml-auto flex max-w-full items-start gap-2.5 rounded-xl bg-emerald-50 px-4 py-3 text-right text-emerald-950 dark:bg-emerald-950/45 dark:text-emerald-100">
              <Wallet size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold">Código {cart.id.slice(0, 8)}</p>
                {buyer?.id === cart.buyerId ? (
                  <p className="mt-1 text-sm font-bold">Saldo · {coins(buyer.ecoCoinBalance)} ecocoins</p>
                ) : (
                  <button type="button" className="mt-1 text-sm font-semibold underline underline-offset-2" disabled={busy}
                    aria-expanded={showBalanceLookup} onClick={() => setShowBalanceLookup(!showBalanceLookup)}>
                    {showBalanceLookup ? "Fechar consulta" : "Consultar saldo"}
                  </button>
                )}
              </div>
            </div>
          </header>
          {showBalanceLookup && (
            <form onSubmit={lookupCartBalance} className="ml-auto flex max-w-sm flex-wrap items-end gap-2">
              <div className="min-w-0 flex-1">
                <FormInput id="cart-buyer-cpf" label="CPF do munícipe do carrinho" value={cpf}
                  onChange={(event) => setCpf(inputMasks.cpf(event.target.value))}
                  inputMode="numeric" placeholder="000.000.000-00" required disabled={busy} />
              </div>
              <button className={action} disabled={busy}>Consultar</button>
            </form>
          )}
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
            onAdd={addItem}
          />
          <p className="font-semibold">Total de {coins(cart.items.reduce((total, item) => total + Number(item.product.price) * item.quantity, 0))} ecocoins</p>
          <div className="flex flex-wrap items-center gap-4">
            <button type="button" className={action} disabled={busy || !cart.items.length} onClick={checkout}>
              {checkoutUnconfirmed ? "Confirmar resultado da venda" : "Finalizar venda"}
            </button>
            <button type="button" className="ml-auto rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/45" disabled={busy || checkoutUnconfirmed} onClick={() => void perform(async () => {
              await http.delete(cartsUrl + "/" + cart.id);
              setCart(null);
              setBuyer(null);
              setCpf("");
              setShowBalanceLookup(false);
              setRefresh(refresh + 1);
            })}>Cancelar carrinho</button>
          </div>
        </div>
      )}
    </section>
  );
}
