import { AxiosError, type AxiosAdapter } from "axios";
import { decodeJwtPayload } from "./auth-session";
import { demoAccounts, demoCode, demoCpf, demoPassword } from "./demo-config";

const digits = (value: string) => value.replace(/\D/g, "");
const money = (cents: number) => (cents / 100).toFixed(2);
const now = () => new Date().toISOString();
const signDemoToken = (role: string) =>
  [btoa('{"alg":"none"}'), btoa(JSON.stringify({ role, exp: Math.floor(Date.now() / 1000) + 3600 })), "demo"].join(".");

const residents = new Map([[digits(demoCpf), { id: "municipe-demo", balance: 124000, pendingActivation: false }]]);
const demoStock = [
  { name: "Caneca de cerâmica", price: 65, quantity: 12 },
  { name: "Kit de canudos inox", price: 38, quantity: 24 },
  { name: "Caderno reciclado", price: 32, quantity: 41 },
  { name: "Pote hermético", price: 58, quantity: 9 },
  { name: "Marmita de inox", price: 135, quantity: 6 },
  { name: "Garrafa esportiva", price: 80, quantity: 16 },
  { name: "Ecobag dobrável", price: 42, quantity: 19 },
  { name: "Mochila de lona", price: 165, quantity: 4 },
  { name: "Necessaire de algodão", price: 55, quantity: 11 },
  { name: "Porta-talheres de tecido", price: 29, quantity: 20 },
  { name: "Jogo de talheres de bambu", price: 48, quantity: 15 },
  { name: "Copo retrátil", price: 72, quantity: 7 },
  { name: "Caneca térmica", price: 105, quantity: 8 },
  { name: "Vaso de fibra de coco", price: 23, quantity: 26 },
  { name: "Kit de sementes de manjericão", price: 18, quantity: 35 },
  { name: "Regador de jardim", price: 47, quantity: 6 },
  { name: "Pá de jardinagem", price: 26, quantity: 14 },
  { name: "Composteira doméstica", price: 245, quantity: 2 },
  { name: "Sabonete vegetal", price: 16, quantity: 28 },
  { name: "Escova de bambu", price: 22, quantity: 33 },
  { name: "Bucha vegetal", price: 14, quantity: 45 },
  { name: "Porta-sabonete de madeira", price: 27, quantity: 10 },
  { name: "Pano de limpeza reutilizável", price: 19, quantity: 36 },
  { name: "Guardanapos de tecido", price: 35, quantity: 17 },
  { name: "Estojo de lona", price: 34, quantity: 21 },
  { name: "Lápis plantável", price: 12, quantity: 52 },
  { name: "Marcadores de página reciclados", price: 10, quantity: 38 },
  { name: "Caixa organizadora", price: 63, quantity: 13 },
];
const products = [
  { id: "garrafa", name: "Garrafa térmica", description: "Aço reciclado, 600 ml", price: "120.00", quantity: 18, barcode: "7891234567895", photo: "/mock-bottle.svg" },
  { id: "ecobag", name: "Ecobag", description: "Sacola reutilizável", price: "45.00", quantity: 32, barcode: "7891234567888", photo: "/mock-bag.svg" },
  ...demoStock.map(({ name, price, quantity }, index) => {
    const code = String(index + 3).padStart(3, "0");
    return {
      id: "produto-demo-" + code,
      name,
      description: "Produto do catálogo de demonstração",
      price: price.toFixed(2),
      quantity,
      barcode: "DEMO-" + code,
      photo: "",
    };
  }),
];
type Cart = { id: string; buyerId: string; expiresAt: string; items: { productId: string; quantity: number; product: typeof products[number] }[] };
const carts = new Map<string, Cart>();
const sales = new Map<string, { saleId: string; total: string; ecoCoinBalance: string }>();
const credits = new Map<string, { auditId: string; ecoCoinBalance: string }>();
let pointsDistributed = 0;
let pickupCompleted = false;
let term = { title: "Termo de uso de demonstração", text: "Ambiente de demonstração com dados fictícios." };

export const demoAdapter: AxiosAdapter = async (config) => {
  const url = new URL(config.url ?? "", "http://demo.test/");
  const route = config.method?.toUpperCase() + " " + url.pathname;
  const body = config.data ? JSON.parse(config.data) : {};
  const token = String(config.headers.get("Authorization") ?? "").replace("Bearer ", "");
  const role = token.endsWith(".demo") ? decodeJwtPayload(token)?.role : null;
  const response = (data: unknown, status = 200) => ({ data, status, statusText: String(status), headers: {}, config });
  const fail = (message: string, status = 400): never => {
    throw new AxiosError(message, AxiosError.ERR_BAD_REQUEST, config, undefined, response({ message }, status));
  };
  const allow = (...roles: string[]) => {
    if (typeof role !== "string" || !roles.includes(role)) fail("Acesso indisponível para este perfil.", 403);
  };

  switch (route) {
    case "POST /auth/login": {
      const account = demoAccounts.find(({ email }) => email === String(body.email).trim().toLowerCase());
      if (!account || body.password !== demoPassword) return fail("Use uma das contas de demonstração.", 401);
      return response({ challengeId: account.email });
    }
    case "POST /auth/2fa/verify": {
      const account = demoAccounts.find(({ email }) => email === body.challengeId);
      if (!account || body.code !== demoCode) return fail("Código inválido. Na demonstração, use 123456.", 401);
      return response({ token: signDemoToken(account.role) });
    }
    case "POST /auth/logout":
      return response(null, 204);
    case "GET /account/sessions":
      return response({
        sessions: [{ id: "sessao-demo", createdAt: now(), browser: "Navegador", device: "Computador", city: "São Paulo", region: "SP", status: "CURRENT" }],
        pagination: { totalPages: 1 },
      });
    case "GET /terms/current":
      return response({ term });
    case "POST /terms/create":
      allow("MASTER");
      term = { title: body.title, text: body.text };
      return response({ term }, 201);
    case "POST /auth/register/admin":
    case "POST /auth/register/cooperative":
      allow("MASTER");
      return response({ id: crypto.randomUUID() }, 201);
    case "GET /master/dashboard":
      allow("MASTER");
      return response({
        lastRegistration: { name: "Cooperativa Modelo", role: "COOPERATIVA", createdAt: now() },
        pointsDistributed: { total: money(128465000 + pointsDistributed), currentMonth: money(490000 + pointsDistributed), changePercent: null },
        threats: { blocked: 2 }, rateLimit: { sanctions: 7, activeClients: 3 },
        recentActivity: [{ id: "operador-demo", kind: "OPERATOR_REGISTERED", name: "Cooperativa Modelo", role: "COOPERATIVA", createdAt: now() }],
        systemHealth: { api: { status: "UP" }, authentication: { status: "UP" }, processing: { status: "UP" } },
      });
    case "POST /residents/pre-registrations": {
      allow("COOPERATIVA", "PrefeituraVendedor");
      const cpf = digits(body.cpf);
      if (residents.has(cpf)) return fail("CPF já cadastrado na demonstração.", 409);
      const resident = { id: crypto.randomUUID(), balance: 0, pendingActivation: true };
      residents.set(cpf, resident);
      return response({ id: resident.id, pendingActivation: true }, 201);
    }
    case "POST /residents/credits": {
      allow("COOPERATIVA");
      const key = String(config.headers.get("Idempotency-Key"));
      const prior = credits.get(key);
      if (prior) return response(prior, 201);
      const resident = residents.get(digits(body.cpf));
      if (!resident) return fail("Munícipe não encontrado. CPF de teste: " + demoCpf, 404);
      const credited = Math.round(Number(body.amount) * 100);
      resident.balance += credited;
      pointsDistributed += credited;
      const receipt = { auditId: crypto.randomUUID(), ecoCoinBalance: money(resident.balance) };
      credits.set(key, receipt);
      return response(receipt, 201);
    }
    case "POST /residents/lookup": {
      allow("PrefeituraVendedor");
      const resident = residents.get(digits(body.cpf));
      if (!resident) return fail("Munícipe não encontrado. CPF de teste: " + demoCpf, 404);
      return response({ id: resident.id, ecoCoinBalance: money(resident.balance), pendingActivation: resident.pendingActivation });
    }
  }

  if (!url.pathname.startsWith("/store/admin/")) return fail("Esta operação está disponível com a API real.", 501);
  allow("PrefeituraVendedor");

  switch (route) {
    case "GET /store/admin/dashboard":
      return response({ ordersCollected: 12 + sales.size, usersServed: 8, pointsRedeemed: "2860.00",
        recentOrders: [{ id: "pedido-demo", user: { name: "Munícipe de exemplo" }, collectedAt: now(),
          items: [{ productId: "ecobag", name: "Ecobag", quantity: 2 }] }],
        topItems: [
          { productId: "ecobag", productName: "Ecobag", units: 15, sharePercent: 60 },
          { productId: "garrafa", productName: "Garrafa térmica", units: 10, sharePercent: 40 },
        ],
      });
    case "GET /store/admin/products": {
      const search = (url.searchParams.get("search") ?? "").toLowerCase();
      const barcode = url.searchParams.get("barcode");
      const stock = url.searchParams.get("stock");
      const matching = products.filter((product) => (product.name + " " + product.description).toLowerCase().includes(search) &&
        (!barcode || barcode === product.barcode) && (stock === "available" ? product.quantity > 0 : stock !== "out" || product.quantity === 0));
      const offset = (Number(url.searchParams.get("page") ?? 1) - 1) * 9;
      return response({ products: matching.slice(offset, offset + 9), pagination: { totalPages: Math.ceil(matching.length / 9) } });
    }
    case "POST /store/admin/products": {
      const product = { ...body, id: crypto.randomUUID(), barcode: body.barcode ?? "", price: body.price.replace(",", ".") };
      products.push(product);
      return response({ product }, 201);
    }
    case "POST /store/admin/redemptions/validate":
      if (pickupCompleted || body.code.toUpperCase() !== "ABCD1234EF56") return fail("Código inválido ou já usado. Código de teste: ABCD1234EF56.", 404);
      pickupCompleted = true;
      return response({ redemption: { id: "retirada-demo", product: products[0] } });
    case "GET /store/admin/carts":
      return response({ carts: [...carts.values()] });
    case "POST /store/admin/carts": {
      const cart = { id: crypto.randomUUID(), buyerId: body.buyerId, expiresAt: new Date(Date.now() + 86400000).toISOString(), items: [] };
      carts.set(cart.id, cart);
      return response(cart, 201);
    }
  }

  const [, , , resource, id, action] = url.pathname.split("/");
  if (resource === "products" && action === "stock" && config.method === "patch") {
    const product = products.find((item) => item.id === id);
    if (!product) return fail("Item não encontrado.", 404);
    if (product.quantity !== body.expectedQuantity) return fail("O estoque foi alterado.", 409);
    product.quantity = body.quantity;
    return response({ product });
  }
  if (resource !== "carts") return fail("Esta operação está disponível com a API real.", 501);
  if (action === "checkout" && sales.has(id)) return response(sales.get(id), 201);
  const cart = carts.get(id);
  if (!cart) return fail("Carrinho não encontrado.", 404);
  if (config.method === "get") return response(cart);
  if (config.method === "delete") {
    carts.delete(id);
    return response(null, 204);
  }
  if (action === "items") {
    const product = products.find((item) => body.barcode ? item.barcode === body.barcode : item.id === body.productId);
    if (!product || body.quantity > product.quantity) return fail("Item indisponível ou sem estoque suficiente.", 409);
    cart.items = cart.items.filter((item) => item.productId !== product.id);
    if (body.quantity > 0) cart.items.push({ productId: product.id, quantity: body.quantity, product });
    return response({ ...cart });
  }
  if (action === "checkout") {
    const buyer = [...residents.values()].find((resident) => resident.id === cart.buyerId);
    const total = cart.items.reduce((sum, item) => sum + Math.round(Number(item.product.price) * 100) * item.quantity, 0);
    if (!buyer || buyer.balance < total || cart.items.some((item) => item.quantity > item.product.quantity)) {
      return fail("Saldo ou estoque insuficiente.", 409);
    }
    buyer.balance -= total;
    cart.items.forEach(({ product, quantity }) => { product.quantity -= quantity; });
    const receipt = { saleId: cart.id, total: money(total), ecoCoinBalance: money(buyer.balance) };
    sales.set(id, receipt);
    carts.delete(id);
    return response(receipt, 201);
  }
  return fail("Esta operação está disponível com a API real.", 501);
};
