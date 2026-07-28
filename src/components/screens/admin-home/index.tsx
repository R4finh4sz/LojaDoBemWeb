"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, BarChart3, BookOpen, Camera, CheckCircle2, ClipboardCheck, Coins, Gift, LogOut, Menu, PackagePlus, Pencil, Recycle, Search, Shield, UserCircle2, Users } from "lucide-react";
import AuthGuard from "@/components/ui/auth-guard";
import { clearAuthSession, getStoredAvatarUrl, getStoredUserName } from "@/app/service/api/auth-session";
import { FormInput } from "@/components/ui/form-input";
import { useGlobalModalStore } from "@/stores/useGlobalModalStore";
import { editItemSchema, itemSchema, type EditItemInput, type ItemInput } from "@/validation/admin-items";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ProfilePage } from "@/components/screens/master-home/profile-page";
import ErrorModal from "@/components/ui/modal/ErrorModal";

type AdminTab = "overview" | "points" | "items" | "catalog" | "withdrawal" | "profile" | "terms";
type Product = { code: string; name: string; points: number; image: string; customer: string };
type Account = { id: string; name: string; emailHint: string; balance: number };
type PointsReceipt = { account: Account; amount: number; reason: string; protocol: string };

const products: Product[] = [
  { code: "REC-2048", name: "Garrafa térmica reciclada", points: 850, image: "/mock-bottle.svg", customer: "Ana Souza" },
  { code: "REC-7315", name: "Ecobag retornável", points: 420, image: "/mock-bag.svg", customer: "Carlos Lima" },
];

const accounts: Account[] = [
  { id: "USR-1042", name: "Ana Souza", emailHint: "a***@email.com", balance: 1240 },
  { id: "USR-2087", name: "Carlos Lima", emailHint: "c***@email.com", balance: 680 },
  { id: "USR-3159", name: "Beatriz Costa", emailHint: "b***@email.com", balance: 2100 },
];

const collectedOrders = [
  ["#PED-1048", "Ana Souza", "Garrafa térmica", "Hoje, 10:42"],
  ["#PED-1047", "Marcos Alves", "Ecobag retornável", "Hoje, 09:18"],
  ["#PED-1046", "Beatriz Costa", "Kit de canudos", "Ontem, 17:36"],
  ["#PED-1045", "Paulo Nunes", "Vaso sustentável", "Ontem, 15:02"],
];

const catalogItems = [
  { id: 1, name: "Garrafa térmica reciclada", description: "Garrafa térmica produzida com aço reciclado, capacidade de 600 ml.", category: "Uso pessoal", points: "850", stock: "18", image: "/mock-bottle.svg" },
  { id: 2, name: "Ecobag retornável", description: "Bolsa reutilizável de alta resistência feita com tecido reciclado.", category: "Moda sustentável", points: "420", stock: "32", image: "/mock-bag.svg" },
];

const tabs = [
  { id: "overview", label: "Visão geral", icon: BarChart3 },
  { id: "points", label: "Adicionar ecocoins", icon: Coins },
  { id: "items", label: "Cadastrar item", icon: PackagePlus },
  { id: "catalog", label: "Itens cadastrados", icon: Pencil },
  { id: "withdrawal", label: "Confirmar retirada", icon: ClipboardCheck },
  { id: "profile", label: "Perfil", icon: UserCircle2 },
  { id: "terms", label: "Termos de uso", icon: BookOpen },
] satisfies { id: AdminTab; label: string; icon: typeof BarChart3 }[];

export const AdminHome = () => {
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [editingItem, setEditingItem] = useState<(typeof catalogItems)[number] | null>(null);
  const [editPhoto, setEditPhoto] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [codeSearched, setCodeSearched] = useState(false);
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [receipt, setReceipt] = useState<Product | null>(null);
  const [accountCode, setAccountCode] = useState("");
  const [accountSearched, setAccountSearched] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [pointsAmount, setPointsAmount] = useState("");
  const [pointsReason, setPointsReason] = useState("");
  const [pointsError, setPointsError] = useState("");
  const [pointsReceipt, setPointsReceipt] = useState<PointsReceipt | null>(null);
  const showSuccess = useGlobalModalStore((state) => state.showSuccess);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ItemInput>({ resolver: zodResolver(itemSchema) });
  const editForm = useForm<EditItemInput>({ resolver: zodResolver(editItemSchema) });
  const adminName = getStoredUserName() ?? "Administrador";
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => getStoredAvatarUrl());
  const initials = useMemo(() => adminName.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "A", [adminName]);

  useEffect(() => {
    const refreshAvatar = () => setAvatarUrl(getStoredAvatarUrl());
    window.addEventListener("profile-updated", refreshAvatar);
    return () => window.removeEventListener("profile-updated", refreshAvatar);
  }, []);

  const photoName = useMemo(() => photo ? "Imagem selecionada" : "Nenhuma imagem selecionada", [photo]);
  const logout = () => { clearAuthSession(); router.replace("/Auth/Login"); };
  const selectPhoto = (file?: File) => {
    if (!file || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return;
    setPhoto(URL.createObjectURL(file));
    setPhotoError("");
  };
  const submitItem = () => {
    if (!photo) { setPhotoError("Selecione uma foto para cadastrar o item."); return; }
    showSuccess("Item validado e cadastrado na demonstração."); reset(); setPhoto(null);
  };
  const searchCode = () => {
    setReceipt(null);
    setCodeSearched(true);
    setFoundProduct(products.find((product) => product.code === code.trim().toUpperCase()) ?? null);
  };
  const concludeWithdrawal = () => { if (foundProduct) { setReceipt(foundProduct); setFoundProduct(null); } };
  const searchAccount = () => {
    const account = accounts.find((item) => item.id === accountCode.trim().toUpperCase()) ?? null;
    setAccountSearched(true);
    setSelectedAccount(account);
    setPointsReceipt(null);
    setPointsError("");
  };
  const creditPoints = () => {
    const amount = Number(pointsAmount);
    if (!selectedAccount) return;
    if (!Number.isInteger(amount) || amount < 1 || amount > 100000) {
      setPointsError("Informe uma quantidade inteira entre 1 e 100.000 ecocoins.");
      return;
    }
    if (pointsReason.trim().length < 5) {
      setPointsError("Informe o motivo da operação para manter o registro de auditoria.");
      return;
    }
    setPointsReceipt({
      account: selectedAccount,
      amount,
      reason: pointsReason.trim(),
      protocol: `ECO-${Date.now().toString().slice(-8)}`,
    });
    setPointsError("");
    showSuccess(`${amount.toLocaleString("pt-BR")} ecocoins adicionados à conta ${selectedAccount.id}.`);
    setPointsAmount("");
    setPointsReason("");
  };
  const startEditing = (item: (typeof catalogItems)[number]) => {
    setEditingItem(item);
    setEditPhoto(item.image);
    editForm.reset({ description: item.description, category: item.category, points: item.points, stock: item.stock });
  };
  const saveItemChanges = () => { showSuccess("Alterações do item validadas e salvas na demonstração."); setEditingItem(null); };

  return (
    <AuthGuard title="Painel do Administrador" allowedRoles={5}>
      <div className="product-workspace min-h-screen text-slate-900 dark:text-slate-100">
        <div className="flex min-h-screen w-full flex-col lg:flex-row">
          <aside className="editorial-surface border-x-0 border-t-0 px-5 py-5 lg:sticky lg:top-0 lg:min-h-screen lg:w-72 lg:self-start lg:border-b-0 lg:border-r lg:px-6">
            <div className="flex items-center justify-between lg:justify-start lg:gap-3">
              <div className="flex h-11 w-11 items-center justify-center bg-emerald-700 text-white"><Shield size={22} /></div>
              <div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">Área Admin</p><h1 className="text-xl font-semibold text-slate-900">ReciclaOnline</h1></div>
              <button type="button" onClick={() => setMenuOpen((value) => !value)} className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden" aria-label="Abrir menu"><Menu size={18} /></button>
            </div>
            <nav className={`${menuOpen ? "mt-6 flex" : "mt-6 hidden lg:flex"} flex-col gap-2`}>
              {tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => { setTab(id); setMenuOpen(false); }} className={`flex w-full items-center gap-3 border-l-2 px-4 py-3 text-left text-sm font-medium transition ${tab === id ? "border-emerald-700 bg-emerald-50 text-emerald-900 dark:bg-slate-800 dark:text-emerald-300" : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-950"}`}><Icon size={17} />{label}</button>)}
            </nav>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="editorial-surface sticky top-0 z-20 border-x-0 border-t-0 px-5 py-4 lg:px-10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-600">Controle da plataforma</p><h2 className="mt-1 text-2xl font-semibold text-slate-900">Operação Administrativa</h2></div>
                <div className="flex items-center gap-3"><ThemeToggle /><button type="button" onClick={() => setTab("profile")} className="group flex items-center gap-3 px-1 py-1">
                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white">{avatarUrl ? <img src={avatarUrl} alt={adminName} className="h-full w-full object-cover" /> : <span>{initials}</span>}</div>
                  <div className="text-left"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">Administrador</p><p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700">{adminName}</p></div>
                </button></div>
              </div>
            </header>

            <main className="editorial-reveal flex-1 px-5 py-7 lg:px-10 lg:py-10">
              <div className="min-w-0">

          {tab === "overview" && <div className="mt-6 space-y-6">
            <section className="grid gap-5 md:grid-cols-3">
              {[["Pedidos coletados", "1.284", ClipboardCheck], ["Usuários atendidos", "938", Users], ["Pontos resgatados", "486 mil", Gift]].map(([label, value, Icon]) => { const CardIcon = Icon as typeof Gift; return <article key={String(label)} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_42px_rgba(15,23,42,0.14)]"><CardIcon className="text-emerald-600" size={25}/><p className="mt-5 text-sm font-medium text-slate-600">{String(label)}</p><p className="mt-2 text-3xl font-bold">{String(value)}</p></article>; })}
            </section>
            <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_42px_rgba(15,23,42,0.14)]"><h3 className="text-xl font-bold">Últimos pedidos coletados</h3><div className="mt-5 divide-y divide-slate-200">{collectedOrders.map(([order, customer, item, date]) => <div key={order} className="grid gap-2 py-4 first:pt-0 sm:grid-cols-[0.7fr_1fr_1.2fr_1fr]"><strong className="text-sm text-emerald-700">{order}</strong><span className="text-sm">{customer}</span><span className="text-sm text-slate-600">{item}</span><span className="text-sm text-slate-500">{date}</span></div>)}</div></article>
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_42px_rgba(15,23,42,0.14)]"><h3 className="text-xl font-bold">Itens mais retirados</h3><div className="mt-6 space-y-5">{[["Ecobag retornável", 86], ["Garrafa térmica", 68], ["Kit de canudos", 51]].map(([name, percentage], index) => <div key={String(name)}><div className="flex justify-between text-sm"><strong>{index + 1}. {name}</strong><span className="text-slate-500">{percentage}%</span></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${percentage}%` }} /></div></div>)}</div></article>
            </section>
          </div>}

          {tab === "points" && <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_42px_rgba(15,23,42,0.14)] sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><Coins size={25} /></div>
                <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Crédito manual</p><h3 className="mt-1 text-2xl font-bold">Adicionar ecocoins</h3><p className="mt-2 text-sm leading-6 text-slate-600">Localize a conta pelo código apresentado pelo usuário. Para testar, use USR-1042, USR-2087 ou USR-3159.</p></div>
              </div>

              <div className="mt-7">
                <label htmlFor="account-code" className="text-sm font-semibold text-slate-700">Código da conta</label>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                  <input id="account-code" value={accountCode} onChange={(event) => { setAccountCode(event.target.value.toUpperCase()); setAccountSearched(false); setSelectedAccount(null); }} placeholder="USR-0000" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono uppercase outline-none focus:border-emerald-400" />
                  <button type="button" onClick={searchAccount} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"><Search size={17} />Buscar conta</button>
                </div>
                {accountSearched && !selectedAccount && <p className="mt-3 text-sm font-medium text-red-600">Nenhuma conta foi encontrada com esse código.</p>}
              </div>

              {selectedAccount && <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Conta confirmada</p><h4 className="mt-1 text-lg font-bold">{selectedAccount.name}</h4><p className="text-sm text-slate-600">{selectedAccount.id} · {selectedAccount.emailHint}</p></div>
                  <div className="sm:text-right"><p className="text-xs text-slate-500">Saldo atual</p><strong className="text-xl text-emerald-700">{selectedAccount.balance.toLocaleString("pt-BR")} ecocoins</strong></div>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold text-slate-700">Quantidade<input type="number" min="1" max="100000" step="1" value={pointsAmount} onChange={(event) => setPointsAmount(event.target.value)} placeholder="Ex.: 250" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-400" /></label>
                  <label className="text-sm font-semibold text-slate-700">Motivo<select value={pointsReason} onChange={(event) => setPointsReason(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-400"><option value="">Selecione</option><option>Entrega de recicláveis</option><option>Campanha de bonificação</option><option>Ajuste de saldo autorizado</option><option>Outro motivo documentado</option></select></label>
                </div>
                {pointsError && <p className="mt-3 text-sm font-medium text-red-600">{pointsError}</p>}
                <button type="button" onClick={creditPoints} className="mt-5 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700">Confirmar crédito</button>
              </div>}
            </article>

            <article className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_42px_rgba(15,23,42,0.14)] sm:p-8">
              {pointsReceipt ? <div><CheckCircle2 className="text-emerald-600" size={42} /><p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Crédito concluído</p><h3 className="mt-2 text-xl font-bold">Comprovante da operação</h3><div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm"><p className="flex justify-between gap-4"><span>Protocolo</span><strong>{pointsReceipt.protocol}</strong></p><p className="flex justify-between gap-4"><span>Conta</span><strong>{pointsReceipt.account.id}</strong></p><p className="flex justify-between gap-4"><span>Usuário</span><strong className="text-right">{pointsReceipt.account.name}</strong></p><p className="flex justify-between gap-4"><span>Crédito</span><strong className="text-emerald-700">+ {pointsReceipt.amount.toLocaleString("pt-BR")} ecocoins</strong></p><p className="flex justify-between gap-4"><span>Novo saldo</span><strong>{(pointsReceipt.account.balance + pointsReceipt.amount).toLocaleString("pt-BR")}</strong></p><p className="flex justify-between gap-4"><span>Motivo</span><strong className="text-right">{pointsReceipt.reason}</strong></p><p className="flex justify-between gap-4"><span>Operador</span><strong>{adminName}</strong></p><p className="flex justify-between gap-4"><span>Data</span><strong className="text-right">{new Date().toLocaleString("pt-BR")}</strong></p></div></div> : <div className="flex min-h-72 flex-col items-center justify-center text-center text-slate-400"><Coins size={44} /><h3 className="mt-4 font-semibold text-slate-700">Nenhum crédito realizado</h3><p className="mt-2 max-w-xs text-sm leading-6">O protocolo, operador, conta e motivo aparecerão aqui após a confirmação.</p></div>}
            </article>
          </section>}

          {tab === "items" && <form onSubmit={handleSubmit(submitItem)} className="mt-6 grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_42px_rgba(15,23,42,0.14)] lg:grid-cols-[1fr_0.8fr]">
            <div className="space-y-5"><h3 className="text-2xl font-bold">Cadastrar novo item</h3><FormInput {...register("name")} label="Nome do item" error={errors.name} /><FormInput {...register("description")} label="Descrição" error={errors.description} /><label className="block text-sm font-medium text-slate-700">Categoria<select {...register("category")} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-400"><option value="">Selecione</option><option>Casa</option><option>Moda sustentável</option><option>Uso pessoal</option></select>{errors.category && <span className="mt-1 block text-xs text-red-600">{errors.category.message}</span>}</label><div className="grid gap-4 sm:grid-cols-2"><FormInput {...register("points")} type="number" label="Pontos necessários" error={errors.points} /><FormInput {...register("stock")} type="number" label="Estoque inicial" error={errors.stock} /></div><button className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg">Cadastrar item</button></div>
            <div><label className={`flex min-h-72 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed bg-emerald-50 text-center ${photoError ? "border-red-400" : "border-emerald-300"}`}>{photo ? <img src={photo} alt="Prévia do item" className="h-72 w-full object-cover" /> : <><Camera className="text-emerald-700" size={38}/><strong className="mt-4">Selecionar foto do item</strong><span className="mt-2 text-xs text-slate-500">JPG, PNG ou WebP · até 5 MB</span></>}<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => selectPhoto(event.target.files?.[0])}/><span className="sr-only">{photoName}</span></label>{photoError && <p className="mt-2 text-sm text-red-600">{photoError}</p>}</div>
          </form>}

          {tab === "catalog" && <section className="mt-6 space-y-6">
            {!editingItem ? <div><div className="mb-5"><h3 className="text-2xl font-bold">Itens cadastrados</h3><p className="mt-1 text-sm text-slate-600">Consulte o catálogo e selecione um item para editar seus dados.</p></div><div className="grid gap-5 xl:grid-cols-2">{catalogItems.map((item) => <article key={item.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_42px_rgba(15,23,42,0.12)] sm:grid sm:grid-cols-[180px_1fr]"><img src={item.image} alt={item.name} className="h-48 w-full object-cover sm:h-full"/><div className="p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">{item.category}</p><h4 className="mt-2 text-lg font-bold">{item.name}</h4></div><button onClick={() => startEditing(item)} aria-label={`Editar ${item.name}`} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><Pencil size={17}/></button></div><p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p><div className="mt-5 flex gap-6 border-t border-slate-200 pt-4 text-sm"><p><span className="block text-xs text-slate-500">Quantidade</span><strong>{item.stock}</strong></p><p><span className="block text-xs text-slate-500">Pontos</span><strong>{item.points}</strong></p></div></div></article>)}</div></div> :
            <form onSubmit={editForm.handleSubmit(saveItemChanges)} className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_42px_rgba(15,23,42,0.14)] lg:grid-cols-[1fr_0.8fr]"><div className="space-y-5"><div><button type="button" onClick={() => setEditingItem(null)} aria-label="Voltar ao catálogo" title="Voltar ao catálogo" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-emerald-700 transition hover:bg-emerald-50"><ArrowLeft size={20}/></button><h3 className="mt-3 text-2xl font-bold">Editar item</h3></div><FormInput value={editingItem.name} disabled label="Nome do item" helpText="O nome não pode ser alterado após o cadastro."/><FormInput {...editForm.register("description")} label="Descrição" error={editForm.formState.errors.description}/><label className="block text-sm font-medium text-slate-700">Categoria<select {...editForm.register("category")} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"><option>Casa</option><option>Moda sustentável</option><option>Uso pessoal</option></select></label><div className="grid gap-4 sm:grid-cols-2"><FormInput {...editForm.register("points")} type="number" label="Pontos necessários" error={editForm.formState.errors.points}/><FormInput {...editForm.register("stock")} type="number" label="Quantidade atual" error={editForm.formState.errors.stock}/></div><button className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white">Salvar alterações</button></div><label className="flex min-h-72 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-emerald-300 bg-emerald-50">{editPhoto ? <img src={editPhoto} alt="Prévia atual do item" className="h-72 w-full object-cover"/> : <Camera size={38}/>}<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) setEditPhoto(URL.createObjectURL(file)); }}/><span className="mt-3 text-sm font-semibold">Clique para alterar a foto</span></label></form>}
          </section>}

          {tab === "withdrawal" && <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_42px_rgba(15,23,42,0.14)]"><h3 className="text-2xl font-bold">Código de retirada</h3><p className="mt-2 text-sm text-slate-600">Digite o código apresentado pelo cliente. Para testar, use REC-2048 ou REC-7315.</p><div className="mt-6 flex gap-3"><input value={code} onChange={(event) => { setCode(event.target.value.toUpperCase()); setCodeSearched(false); }} placeholder="REC-0000" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono uppercase outline-none focus:border-emerald-400"/><button onClick={searchCode} className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"><Search size={17}/>Buscar</button></div>{codeSearched && !foundProduct && <p className="mt-3 text-sm font-medium text-red-600">Nenhum pedido disponível foi encontrado com esse código.</p>}{foundProduct && <div className="mt-6 flex flex-col gap-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:flex-row"><img src={foundProduct.image} alt={foundProduct.name} className="h-32 w-full rounded-xl object-cover sm:w-44"/><div className="flex-1"><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Pedido encontrado</p><h4 className="mt-2 text-lg font-bold">{foundProduct.name}</h4><p className="mt-1 text-sm text-slate-600">Cliente: {foundProduct.customer}</p><p className="text-sm text-slate-600">{foundProduct.points} pontos</p><button onClick={concludeWithdrawal} className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Confirmar retirada</button></div></div>}</article>
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_42px_rgba(15,23,42,0.14)]">{receipt ? <div><CheckCircle2 className="text-emerald-600" size={42}/><p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Retirada concluída</p><h3 className="mt-2 text-xl font-bold">Comprovante de retirada</h3><div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm"><p className="flex justify-between"><span>Código</span><strong>{receipt.code}</strong></p><p className="flex justify-between gap-4"><span>Item</span><strong className="text-right">{receipt.name}</strong></p><p className="flex justify-between"><span>Cliente</span><strong>{receipt.customer}</strong></p><p className="flex justify-between"><span>Status</span><strong className="text-emerald-700">Concluído</strong></p><p className="flex justify-between"><span>Data</span><strong>{new Date().toLocaleString("pt-BR")}</strong></p></div></div> : <div className="flex min-h-64 flex-col items-center justify-center text-center text-slate-400"><Recycle size={42}/><p className="mt-4 text-sm">O comprovante aparecerá aqui após a confirmação.</p></div>}</article>
          </section>}

          {tab === "profile" && <ProfilePage roleLabel="Administrador" />}

          {tab === "terms" && <article className="mt-6 rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_16px_42px_rgba(15,23,42,0.14)] sm:p-10"><p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">Termos de uso</p><h3 className="mt-2 text-3xl font-bold">Regras da área administrativa</h3><p className="mt-7 max-w-4xl text-base leading-8 text-slate-700">O acesso administrativo ao ReciclaOnline é pessoal e destinado exclusivamente à operação autorizada da plataforma. O administrador é responsável pela conferência dos pedidos, confirmação das retiradas, cadastro correto dos itens e proteção das informações dos usuários. Toda retirada deve ser validada pelo código apresentado pelo cliente, e as ações realizadas podem ser registradas para auditoria, segurança e conformidade. Ao utilizar esta área, o administrador concorda em manter a confidencialidade dos dados e seguir os procedimentos operacionais da organização.</p><p className="mt-8 border-t border-slate-200 pt-5 text-sm text-slate-500">Última atualização: 21 de julho de 2026</p></article>}

              </div>
            </main>
          </div>
        </div>
        <button type="button" onClick={() => setLogoutOpen(true)} className="fixed bottom-5 right-5 inline-flex items-center gap-2 rounded-3xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"><LogOut size={16} />Sair</button>
        <ErrorModal open={logoutOpen} title="Sair da conta?" message="Tem certeza que deseja encerrar sua sessão?" closeLabel="Cancelar" confirmLabel="Sair" onClose={() => setLogoutOpen(false)} onConfirm={logout} />
      </div>
    </AuthGuard>
  );
};

export default AdminHome;
