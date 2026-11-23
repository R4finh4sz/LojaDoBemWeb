"use client";

import { isAxiosError } from "axios";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Hash, ShoppingBag, Trash2, Wallet } from "lucide-react";
import { apiError, http } from "@/app/service/api/http";
import { FormInput } from "@/components/ui/form-input";
import ErrorModal from "@/components/ui/modal/ErrorModal";
import Modal from "@/components/ui/modal/Modal";
import SuccessModal from "@/components/ui/modal/SuccessModal";
import { inputMasks } from "@/utils/input-masks";
import { isValidCpf } from "@/validation/citizen-registration";
import { action, card, coins, type Product } from "../municipal";
import { ProductCarousel } from "./product-carousel";

type Buyer = { id: string; ecoCoinBalance: string; pendingActivation: boolean };
type Cart = { id: string; buyerId: string; expiresAt: string; items: { productId: string; quantity: number; product: Product }[] };
type Receipt = { saleId: string; protocol?: string; buyerName?: string | null; sellerName?: string | null; total: string; ecoCoinBalance: string };
const cartsUrl = "store/admin/carts";

export function AdminStore({ onViewProtocol }: { onViewProtocol: (protocol: string) => void }) {
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [cpf, setCpf] = useState("");
  const [cart, setCart] = useState<Cart | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [checkoutUnconfirmed, setCheckoutUnconfirmed] = useState(false);
  const [confirmation, setConfirmation] = useState<"checkout" | "cancel" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [addedItem, setAddedItem] = useState<{ name: string } | null>(null);
  const inFlight = useRef(false);
  const total = cart?.items.reduce((sum, item) => sum + Math.round(Number(item.product.price) * 100) * item.quantity, 0) ?? 0;

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
    if (inFlight.current || buyer || error) return;
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

  async function checkout() {
    if (!cart?.items.length || inFlight.current) return;
    setConfirmation(null);
    setCheckoutUnconfirmed(true);
    await perform(async () => {
      const { data } = await http.post<Receipt>(cartsUrl + "/" + cart.id + "/checkout");
      setReceipt(data);
      setCheckoutUnconfirmed(false);
      setCart(null);
      setBuyer(null);
      setCpf("");
    }, (error) => {
      if (isAxiosError(error) && error.response && error.response.status < 500) setCheckoutUnconfirmed(false);
    });
  }

  async function cancelCart() {
    if (!cart || inFlight.current || checkoutUnconfirmed) return;
    setConfirmation(null);
    await perform(async () => {
      await http.delete(cartsUrl + "/" + cart.id);
      setCart(null);
      setBuyer(null);
      setCpf("");
    });
  }

  function closeLookupFeedback() {
    if (inFlight.current) return;
    setBuyer(null);
    setError("");
  }

  return (
    <section className="space-y-6">
      <Modal open={confirmation !== null} onClose={() => setConfirmation(null)}>
        <div className="space-y-4">
          {confirmation === "cancel" ? <Trash2 size={24} aria-hidden="true" className="text-red-700 dark:text-red-300" /> :
            <ShoppingBag size={24} aria-hidden="true" className="text-emerald-700 dark:text-emerald-300" />}
          <h3 className="text-xl font-bold text-slate-900">{confirmation === "cancel" ? "Tem certeza que deseja cancelar?" : "Finalizar venda?"}</h3>
          <p className="text-sm text-slate-600">
            {confirmation === "cancel" ? "Os itens serão removidos do carrinho. Nenhum ecocoin será debitado." :
              <>Confirme o débito de <strong>{coins(total / 100)} ecocoins</strong> do saldo do munícipe.</>}
          </p>
          <div className="flex flex-wrap justify-end gap-3">
            <button type="button" onClick={() => setConfirmation(null)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">Voltar</button>
            {confirmation === "cancel" ? (
              <button type="button" onClick={cancelCart} className="rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800">Confirmar cancelamento</button>
            ) : <button type="button" onClick={checkout} className={action}>Confirmar venda</button>}
          </div>
        </div>
      </Modal>
      <SuccessModal open={!!addedItem} onClose={() => setAddedItem(null)}
        title="Item adicionado ao carrinho" message={addedItem?.name} />
      <ErrorModal open={!cart && !!error} onClose={closeLookupFeedback}
        title="Não foi possível continuar" message={error} closeLabel="Voltar" />
      <SuccessModal open={!cart && !!buyer && !error} onClose={closeLookupFeedback} onConfirm={openCart}
        title="Munícipe localizado" message={buyer?.pendingActivation ? "A ativação do cadastro está pendente." : "Você já pode abrir o carrinho deste munícipe."}
        closeLabel="Voltar" confirmLabel={busy ? "Abrindo..." : "Ir ao carrinho"} confirmDisabled={busy} />
      {cart && error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/45 dark:text-red-300">{error}</p>}
      {receipt && (
        <div className={card} role="status">
          <h3 className="text-xl font-bold">Venda concluída</h3>
          <p>Protocolo {receipt.protocol ?? receipt.saleId}</p>
          <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div><dt className="text-slate-600">Comprador</dt><dd className="font-semibold">{receipt.buyerName || "Nome indisponível"}</dd></div>
            <div><dt className="text-slate-600">Vendedor</dt><dd className="font-semibold">{receipt.sellerName || "Nome indisponível"}</dd></div>
          </dl>
          <p>{coins(receipt.total)} ecocoins debitados · Saldo restante de {coins(receipt.ecoCoinBalance)} ecocoins</p>
          <button type="button" className={action} onClick={() => onViewProtocol(receipt.protocol ?? receipt.saleId)}>Ver no histórico</button>
        </div>
      )}
      {!cart ? (
        <form className={card} onSubmit={lookup}>
          <h3 className="text-xl font-bold">Localizar munícipe</h3>
          <FormInput id="sale-cpf" label="CPF" value={cpf} onChange={(event) => {
            setCpf(inputMasks.cpf(event.target.value));
            setBuyer(null);
          }} inputMode="numeric" placeholder="000.000.000-00" required readOnly={busy || !!buyer || !!error} />
          <button className={action} disabled={busy || !!buyer || !!error}>{busy ? "Consultando..." : "Consultar"}</button>
        </form>
      ) : (
        <div className={card} inert={confirmation !== null}>
          <header className="flex flex-wrap items-start justify-between gap-3">
            <h3 className="pt-2 text-xl font-bold">Carrinho</h3>
            <dl className="ml-auto flex max-w-full flex-wrap justify-end gap-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
                <dt className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <Hash size={14} aria-hidden="true" />Código
                </dt>
                <dd className="mt-1 text-sm font-bold">{cart.id.slice(0, 8)}</dd>
              </div>
              {buyer?.id === cart.buyerId && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-2.5 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/45 dark:text-emerald-100">
                  <dt className="flex items-center gap-1.5 text-xs font-semibold">
                    <Wallet size={14} aria-hidden="true" />Saldo
                  </dt>
                  <dd className="mt-1 text-sm font-bold">{coins(buyer.ecoCoinBalance)} ecocoins</dd>
                </div>
              )}
            </dl>
          </header>
          <section aria-labelledby="cart-items-heading" className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 sm:px-5">
            <h4 id="cart-items-heading" className="font-semibold">Itens do carrinho</h4>
            {!cart.items.length ? (
              <p className="mt-2 text-sm text-slate-600">Adicione produtos pelo carrossel abaixo.</p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-200 border-t border-slate-200 dark:divide-slate-700">
                {cart.items.map((item) => (
                  <li key={item.productId} className="flex flex-wrap items-center justify-between gap-3 py-3 last:pb-0">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold">{item.quantity} × {item.product.name}</p>
                      <p className="mt-0.5 text-sm text-slate-600">{coins(Number(item.product.price) * item.quantity)} ecocoins</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button" className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-50" aria-label={"Diminuir quantidade de " + item.product.name} disabled={busy || checkoutUnconfirmed || item.quantity <= 1} onClick={() => void updateItem(item.product, item.quantity - 1)}>−</button>
                      <button type="button" className="text-sm underline disabled:opacity-50" disabled={busy || checkoutUnconfirmed} onClick={() => void updateItem(item.product, 0)}>Remover</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <div className="flex flex-wrap items-center gap-3 py-2">
            <p className="w-full font-semibold sm:w-auto">Total de {coins(total / 100)} ecocoins</p>
            <button type="button" className={action} disabled={busy || !cart.items.length} onClick={() => {
              if (checkoutUnconfirmed) void checkout();
              else setConfirmation("checkout");
            }}>
              {checkoutUnconfirmed ? "Confirmar resultado da venda" : "Finalizar venda"}
            </button>
            <button type="button" className="ml-auto rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/45" disabled={busy || checkoutUnconfirmed} onClick={() => setConfirmation("cancel")}>Cancelar carrinho</button>
          </div>
          <ProductCarousel
            disabled={busy || checkoutUnconfirmed}
            quantityInCart={(id) => cart.items.find((item) => item.productId === id)?.quantity ?? 0}
            onAdd={addItem}
          />
        </div>
      )}
    </section>
  );
}
