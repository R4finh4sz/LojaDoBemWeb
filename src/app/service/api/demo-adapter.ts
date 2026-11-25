import { AxiosError, type AxiosAdapter } from "axios";
import { decodeJwtPayload } from "./auth-session";
import { demoAccounts, demoCode, demoCpf, demoPassword } from "./demo-config";

const digits = (value: string) => value.replace(/\D/g, "");
const money = (cents: number) => (cents / 100).toFixed(2);
const now = () => new Date().toISOString();
type DemoAccount = { email: string; label: string; role: (typeof demoAccounts)[number]["role"] };
const demoOperators = new Map<string, DemoAccount & { id: string; cpf: string; firstLogin: boolean; city: string; state: string }>();
const operatorLoginChallenges = new Map<string, { email: string; expiresAt: number }>();
const firstLoginGrants = new Map<string, { email: string; expiresAt: number }>();
const demoPasswords = new Map<string, string>();
const demoMunicipalities = new Map<string, { id: string; name: string; address: string; cep: string; cnpj: string }>();
const demoSessions = new Map<string, string>();
const revokedSessions = new Set<string>();
const deletedDemoAccounts = new Set<string>();
const passwordChallenges = new Map<string, { id: string; expiresAt: number; resetToken?: string }>();
const demoProfiles = new Map<string, { name: string; email: string; address: string; addressNumber: string | null; jobTitle: string | null; profilePhoto: string | null; twoFactorEnabled: boolean }>();
function signDemoToken(account: DemoAccount) {
  const sid = crypto.randomUUID();
  demoSessions.set(sid, account.email);
  const payload = { sid, role: account.role, exp: Math.floor(Date.now() / 1000) + 3600 };
  return [btoa('{"alg":"none"}'), btoa(JSON.stringify(payload)), "demo"].join(".");
}

const residents = new Map([[digits(demoCpf), { id: "municipe-demo", name: "Ana Paula da Silva", balance: 124000, pendingActivation: false }]]);
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
].map((product) => ({ ...product, active: true }));
type Cart = { id: string; buyerId: string; expiresAt: string; items: { productId: string; quantity: number; product: typeof products[number] }[] };
const carts = new Map<string, Cart>();
const sales = new Map<string, { saleId: string; protocol: string; buyerName: string; sellerName: string; total: string; ecoCoinBalance: string }>();
const saleSequences = new Map<string, number>();
const completedSales: {
  id: string; cartId: string; protocol: string; user: { name: string }; sellerName: string;
  quantity: number; unitPrice: string; totalPrice: string;
  completedAt: string; createdAt: string; status: "COMPLETED"; product: { name: string };
}[] = [];
const credits = new Map<string, { auditId: string; ecoCoinBalance: string; residentName: string }>();
let pointsDistributed = 0;
let pickupCompleted = false;
let term = { documentId: "00000000-0000-4000-8000-000000000001", version: 1, title: "Termo de uso de demonstração", text: "Ambiente de demonstração com dados fictícios." };

export const demoAdapter: AxiosAdapter = async (config) => {
  const url = new URL(config.url ?? "", "http://demo.test/");
  const route = config.method?.toUpperCase() + " " + url.pathname;
  const body = config.data ? JSON.parse(config.data) : {};
  const token = String(config.headers.get("Authorization") ?? "").replace("Bearer ", "");
  const payload = token.endsWith(".demo") ? decodeJwtPayload(token) : null;
  const sessionId = typeof payload?.sid === "string" ? payload.sid : token;
  const role = revokedSessions.has(sessionId) ? null : payload?.role;
  const response = (data: unknown, status = 200) => ({ data: structuredClone(data), status, statusText: String(status), headers: {}, config });
  const fail = (message: string, status = 400): never => {
    throw new AxiosError(message, AxiosError.ERR_BAD_REQUEST, config, undefined, response({ message }, status));
  };
  const allow = (...roles: string[]) => {
    if (typeof role !== "string" || !roles.includes(role)) fail("Acesso indisponível para este perfil.", 403);
  };
  const activeAccount = () => {
    if (!role) return;
    const email = demoSessions.get(sessionId);
    return email ? demoOperators.get(email) ?? demoAccounts.find((account) => account.email === email)
      : demoAccounts.find((account) => account.role === role);
  };
  function accountProfile() {
    const account = activeAccount();
    if (!account) return fail("Acesso indisponível para este perfil.", 403);
    return demoProfiles.get(account.email) ?? {
      name: account.label, email: account.email, address: "Rua de demonstração", addressNumber: "100",
      jobTitle: null, profilePhoto: null, twoFactorEnabled: true,
    };
  }

  switch (route) {
    case "POST /auth/login": {
      const email = String(body.email).trim().toLowerCase();
      const operator = demoOperators.get(email);
      const account = operator ?? demoAccounts.find((item) => item.email === email);
      if (!account || deletedDemoAccounts.has(account.email) || body.password !== (demoPasswords.get(account.email) ?? demoPassword)) return fail("Credenciais de demonstração inválidas.", 401);
      if (!operator?.firstLogin && demoProfiles.get(account.email)?.twoFactorEnabled === false) {
        return response({ twoFactorRequired: false, token: signDemoToken(account) });
      }
      if (operator) {
        const challengeId = crypto.randomUUID();
        operatorLoginChallenges.set(challengeId, { email, expiresAt: Date.now() + 10 * 60_000 });
        return response({ twoFactorRequired: true, challengeId });
      }
      return response({ twoFactorRequired: true, challengeId: account.email });
    }
    case "POST /auth/2fa/verify": {
      const challenge = operatorLoginChallenges.get(body.challengeId);
      if (challenge) {
        const operator = demoOperators.get(challenge.email);
        if (!operator || deletedDemoAccounts.has(operator.email) || challenge.expiresAt <= Date.now() || body.code !== demoCode) {
          return fail("Código inválido ou expirado.", 401);
        }
        operatorLoginChallenges.delete(body.challengeId);
        if (!operator.firstLogin) return response({ token: signDemoToken(operator) });
        const firstLoginToken = crypto.randomUUID();
        firstLoginGrants.set(firstLoginToken, { email: operator.email, expiresAt: Date.now() + 15 * 60_000 });
        return response({ firstLogin: true, firstLoginToken });
      }
      const account = demoAccounts.find(({ email }) => email === body.challengeId);
      if (!account || deletedDemoAccounts.has(account.email) || body.code !== demoCode) return fail("Código inválido. Na demonstração, use 123456.", 401);
      return response({ token: signDemoToken(account) });
    }
    case "GET /auth/first-login/terms":
    case "POST /auth/first-login": {
      const grant = firstLoginGrants.get(token);
      const operator = grant && demoOperators.get(grant.email);
      if (!grant || grant.expiresAt <= Date.now() || !operator?.firstLogin) return fail("Primeiro acesso inválido ou expirado.", 401);
      if (route === "GET /auth/first-login/terms") return response(term);
      if (body.termDocumentId !== term.documentId) return fail("Os termos foram atualizados. Aceite a versão vigente.", 409);
      if (body.termsAccepted !== true || typeof body.password !== "string" || body.password.length < 8 ||
          body.password !== body.passwordConfirmation || new TextEncoder().encode(body.password).length > 72 ||
          body.password.trim().replace(/[.-]/g, "") === operator.cpf) {
        return fail("Confirme os termos e informe uma senha válida diferente do CPF.");
      }
      operator.firstLogin = false;
      demoPasswords.set(operator.email, body.password);
      firstLoginGrants.delete(token);
      return response({ token: signDemoToken(operator) });
    }
    case "POST /auth/logout":
      passwordChallenges.delete(sessionId);
      revokedSessions.add(sessionId);
      return response(null, 204);
    case "POST /account/password/code": {
      allow("MASTER", "PrefeituraVendedor", "COOPERATIVA");
      const challenge = { id: crypto.randomUUID(), expiresAt: Date.now() + 10 * 60_000 };
      passwordChallenges.set(sessionId, challenge);
      return response({ challengeId: challenge.id, expiresAt: new Date(challenge.expiresAt).toISOString() });
    }
    case "POST /account/password/verify-code": {
      allow("MASTER", "PrefeituraVendedor", "COOPERATIVA");
      const challenge = passwordChallenges.get(sessionId);
      if (!challenge || challenge.id !== body.challengeId || challenge.resetToken || challenge.expiresAt <= Date.now() || body.code !== demoCode) {
        return fail("Código inválido ou expirado.");
      }
      challenge.resetToken = crypto.randomUUID();
      return response({ resetToken: challenge.resetToken });
    }
    case "POST /account/password/change": {
      allow("MASTER", "PrefeituraVendedor", "COOPERATIVA");
      const account = activeAccount();
      const challenge = passwordChallenges.get(sessionId);
      if (!account || !challenge?.resetToken || challenge.resetToken !== body.resetToken || challenge.expiresAt <= Date.now()) {
        return fail("Verificação inválida ou expirada.");
      }
      if (typeof body.password !== "string" || body.password.length < 8 || body.password !== body.passwordConfirmation || new TextEncoder().encode(body.password).length > 72) {
        return fail("Preencha e confirme uma nova senha válida.");
      }
      demoPasswords.set(account.email, body.password);
      passwordChallenges.delete(sessionId);
      for (const [id, email] of demoSessions) {
        if (email === account.email && id !== sessionId) {
          revokedSessions.add(id);
          passwordChallenges.delete(id);
        }
      }
      return response(null, 204);
    }
    case "GET /account/profile":
      return response(accountProfile());
    case "DELETE /account": {
      const { email } = accountProfile();
      if (body.password !== (demoPasswords.get(email) ?? demoPassword)) return fail("Senha atual inválida", 403);
      deletedDemoAccounts.add(email);
      demoProfiles.delete(email);
      demoPasswords.delete(email);
      for (const [id, sessionEmail] of demoSessions) {
        if (sessionEmail === email) {
          revokedSessions.add(id);
          passwordChallenges.delete(id);
        }
      }
      revokedSessions.add(sessionId);
      return response(null, 204);
    }
    case "PATCH /account/two-factor": {
      const profile = accountProfile();
      if (typeof body.enabled !== "boolean") return fail("Informe o estado do 2FA.");
      if (body.password !== (demoPasswords.get(profile.email) ?? demoPassword)) return fail("Senha atual inválida", 403);
      demoProfiles.set(profile.email, { ...profile, twoFactorEnabled: body.enabled });
      return response({ twoFactorEnabled: body.enabled });
    }
    case "PATCH /account/profile": {
      const profile = accountProfile();
      if (Object.keys(body).length === 0 || Object.keys(body).some((key) => !["address", "addressNumber", "jobTitle", "profilePhoto"].includes(key))) {
        return fail("Informe pelo menos um dado do perfil.");
      }
      if (body.address !== undefined && (typeof body.address !== "string" || !body.address.trim() || body.address.trim().length > 255)) {
        return fail("Informe um endereço de até 255 caracteres.");
      }
      if (body.addressNumber != null && (typeof body.addressNumber !== "string" || !body.addressNumber.trim() || body.addressNumber.trim().length > 30)) {
        return fail("Informe um número de até 30 caracteres.");
      }
      if (body.jobTitle !== undefined && (typeof body.jobTitle !== "string" || body.jobTitle.trim().length > 100)) {
        return fail("A função deve ter no máximo 100 caracteres.");
      }
      if (body.profilePhoto !== undefined && (typeof body.profilePhoto !== "string" || body.profilePhoto.length > 700000 ||
        !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(body.profilePhoto))) {
        return fail("Selecione uma foto JPG, PNG ou WebP válida.");
      }
      const updated = {
        ...profile,
        ...(body.address !== undefined && { address: body.address.trim() }),
        ...(body.addressNumber !== undefined && { addressNumber: body.addressNumber?.trim() ?? null }),
        ...(body.jobTitle !== undefined && { jobTitle: body.jobTitle.trim() || null }),
        ...(body.profilePhoto !== undefined && { profilePhoto: body.profilePhoto }),
      };
      demoProfiles.set(profile.email, updated);
      return response(updated);
    }
    case "GET /account/export":
      if (url.searchParams.get("format") !== "json") return fail("Esta exportação está disponível com a API real.", 501);
      return response({
        exportedAt: now(), account: { ...accountProfile(), role },
        terms: [], redemptions: [], ecoCoinTransactions: [], products: [],
      });
    case "GET /account/sessions":
      allow("MASTER", "PrefeituraVendedor", "COOPERATIVA");
      return response({
        sessions: [{ id: "sessao-demo", createdAt: now(), browser: "Navegador", device: "Computador", city: "São Paulo", region: "SP", status: "CURRENT" }],
        pagination: { totalPages: 1 },
      });
    case "GET /terms/current":
      return response({ term });
    case "POST /terms/create":
      allow("MASTER");
      term = { documentId: crypto.randomUUID(), version: term.version + 1, title: body.title, text: body.text };
      return response({ term }, 201);
    case "POST /auth/register/admin":
    case "POST /auth/register/cooperative": {
      allow("MASTER");
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      const cpf = typeof body.cpf === "string" ? digits(body.cpf) : "";
      if (!email || cpf.length !== 11 || typeof body.name !== "string" || !body.name.trim()) return fail("Dados inválidos.");
      if (demoAccounts.some((account) => account.email === email) || demoOperators.has(email) ||
          [...demoOperators.values()].some((operator) => operator.cpf === cpf)) {
        return fail("CPF ou e-mail já cadastrado.", 409);
      }
      const operatorRole = route.endsWith("/admin") ? "PrefeituraVendedor" : "COOPERATIVA";
      const id = crypto.randomUUID();
      demoOperators.set(email, {
        id, email, label: body.name, role: operatorRole, cpf, firstLogin: true,
        city: typeof body.city === "string" ? body.city : "",
        state: typeof body.state === "string" ? body.state : "",
      });
      demoPasswords.set(email, cpf);
      demoProfiles.set(email, {
        name: body.name, email, address: body.address, addressNumber: null,
        jobTitle: null, profilePhoto: null, twoFactorEnabled: false,
      });
      return response({ user: { id } }, 201);
    }
    case "GET /master/operators": {
      allow("MASTER");
      const operatorRole = url.searchParams.get("role");
      if (operatorRole !== "PrefeituraVendedor" && operatorRole !== "COOPERATIVA") return fail("Informe um perfil de operador válido.");
      const operators = [...demoOperators.values()].filter((operator) => operator.role === operatorRole && !deletedDemoAccounts.has(operator.email))
        .map(({ id, label, email, city, state }) => ({
          id, name: label, email, municipality: city && state ? { name: null, city, state } : null,
        })).sort((first, second) => first.name.localeCompare(second.name, "pt-BR"));
      return response({ operators });
    }
    case "GET /master/municipalities":
      allow("MASTER");
      return response({ municipalities: [...demoMunicipalities.values()].sort((first, second) => first.name.localeCompare(second.name, "pt-BR")) });
    case "POST /master/municipalities": {
      allow("MASTER");
      const { name, address, cep, cnpj } = body;
      if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 150 ||
          typeof address !== "string" || !address.trim() || address.trim().length > 255 ||
          typeof cep !== "string" || !/^\d{8}$/.test(cep) ||
          typeof cnpj !== "string" || !/^[A-Z0-9]{12}\d{2}$/.test(cnpj)) {
        return fail("Dados da prefeitura inválidos.");
      }
      if (demoMunicipalities.has(cnpj)) return fail("Já existe uma prefeitura cadastrada com este CNPJ.", 409);
      const municipality = { id: crypto.randomUUID(), name: name.trim(), address: address.trim(), cep, cnpj };
      demoMunicipalities.set(cnpj, municipality);
      return response(municipality, 201);
    }
    case "GET /master/dashboard":
      allow("MASTER");
      return response({
        lastRegistration: { name: "Cooperativa Modelo", role: "COOPERATIVA", createdAt: now() },
        pointsDistributed: { total: money(128465000 + pointsDistributed), currentMonth: money(490000 + pointsDistributed), changePercent: null },
        threats: { blocked: 2 }, rateLimit: { sanctions: 7, activeClients: 3 },
        recentActivity: [{ id: "operador-demo", kind: "OPERATOR_REGISTERED", name: "Cooperativa Modelo", role: "COOPERATIVA", createdAt: now() }],
        systemHealth: { api: { status: "UP" }, authentication: { status: "UP" }, processing: { status: "UP" } },
      });
    case "GET /residents": {
      allow("PrefeituraVendedor");
      const page = Number(url.searchParams.get("page") ?? 1);
      if (!Number.isInteger(page) || page < 1) return fail("Página inválida.");
      const registered = [...residents.values()].reverse();
      const start = (page - 1) * 20;
      return response({
        residents: registered.slice(start, start + 20).map(({ id, name, pendingActivation }) => ({ id, name, pendingActivation })),
        pagination: { totalPages: Math.ceil(registered.length / 20) },
      });
    }
    case "POST /residents/pre-registrations": {
      allow("PrefeituraVendedor");
      if (body.termsAccepted !== true) return fail("Confirme que o munícipe aceitou os termos.", 400);
      const cpf = digits(body.cpf);
      if (residents.has(cpf)) return fail("CPF já cadastrado na demonstração.", 409);
      const resident = { id: crypto.randomUUID(), name: body.name, balance: 0, pendingActivation: true };
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
      const receipt = { auditId: crypto.randomUUID(), ecoCoinBalance: money(resident.balance), residentName: resident.name };
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

  const masterDelete = /^\/master\/(operators|municipalities)\/([^/]+)$/.exec(url.pathname);
  if (masterDelete && config.method === "delete") {
    allow("MASTER");
    const [, collection, targetId] = masterDelete;
    if (collection === "municipalities") {
      const municipality = [...demoMunicipalities.values()].find(({ id }) => id === targetId);
      if (!municipality) return fail("Prefeitura não encontrada.", 404);
      demoMunicipalities.delete(municipality.cnpj);
      return response(null, 204);
    }

    const operatorRole = url.searchParams.get("role");
    if (operatorRole !== "PrefeituraVendedor" && operatorRole !== "COOPERATIVA") return fail("Informe um operador válido.");
    const operator = [...demoOperators.values()].find(({ id, role, email }) =>
      id === targetId && role === operatorRole && !deletedDemoAccounts.has(email));
    if (!operator) return fail("Conta não encontrada para exclusão.", 404);
    deletedDemoAccounts.add(operator.email);
    demoPasswords.delete(operator.email);
    demoProfiles.delete(operator.email);
    for (const [id, email] of demoSessions) {
      if (email !== operator.email) continue;
      revokedSessions.add(id);
      passwordChallenges.delete(id);
    }
    return response(null, 204);
  }

  const pendingResidentId = /^\/residents\/pre-registrations\/([^/]+)$/.exec(url.pathname)?.[1];
  const municipalResidentId = /^\/residents\/([^/]+)$/.exec(url.pathname)?.[1];
  if ((pendingResidentId || municipalResidentId) && config.method === "delete") {
    allow(pendingResidentId ? "MASTER" : "PrefeituraVendedor");
    const entry = [...residents].find(([, resident]) => resident.id === (pendingResidentId ?? municipalResidentId) &&
      (!pendingResidentId || resident.pendingActivation));
    if (!entry) return fail("Conta não encontrada para exclusão.", 404);
    residents.delete(entry[0]);
    return pendingResidentId ? response(null, 204) : response({ deleted: true, emailSent: false });
  }

  if (!url.pathname.startsWith("/store/admin/")) return fail("Esta operação está disponível com a API real.", 501);
  allow("PrefeituraVendedor");

  switch (route) {
    case "GET /store/admin/dashboard":
      return response({ ordersCollected: 12 + sales.size, usersServed: 8, pointsRedeemed: "2860.00",
        recentOrders: [
          { id: "pedido-demo-1", user: { name: "Ana Paula da Silva" }, collectedAt: now(),
            items: [{ productId: "ecobag", name: "Ecobag", quantity: 2 }] },
          { id: "pedido-demo-2", user: { name: "Gabriel Santos Almeida" }, collectedAt: new Date(Date.now() - 25 * 60_000).toISOString(),
            items: [{ productId: "garrafa", name: "Garrafa térmica", quantity: 1 }, { productId: "produto-demo-003", name: "Caneca de cerâmica", quantity: 1 }] },
          { id: "pedido-demo-3", user: { name: "Juliana Ribeiro Costa" }, collectedAt: new Date(Date.now() - 55 * 60_000).toISOString(),
            items: [{ productId: "produto-demo-003", name: "Caneca de cerâmica", quantity: 2 }] },
        ],
        topItems: [
          { productId: "ecobag", productName: "Ecobag", units: 15, sharePercent: 50 },
          { productId: "garrafa", productName: "Garrafa térmica", units: 10, sharePercent: 33.33 },
          { productId: "produto-demo-003", productName: "Caneca de cerâmica", units: 5, sharePercent: 16.67 },
        ],
      });
    case "GET /store/admin/products": {
      const search = (url.searchParams.get("search") ?? "").toLowerCase();
      const barcode = url.searchParams.get("barcode");
      const stock = url.searchParams.get("stock");
      const matching = products.filter((product) => (product.name + " " + product.description).toLowerCase().includes(search) &&
        (!barcode || barcode === product.barcode) && (stock === "available" ? product.active && product.quantity > 0 : stock !== "out" || product.quantity === 0));
      const offset = (Number(url.searchParams.get("page") ?? 1) - 1) * 9;
      return response({ products: matching.slice(offset, offset + 9), pagination: { totalPages: Math.ceil(matching.length / 9) } });
    }
    case "POST /store/admin/products": {
      const product = { ...body, id: crypto.randomUUID(), barcode: body.barcode ?? "", price: body.price.replace(",", "."), active: true };
      products.push(product);
      return response({ product }, 201);
    }
    case "POST /store/admin/redemptions/validate":
      if (pickupCompleted || body.code.toUpperCase() !== "ABCD1234EF56") return fail("Código inválido ou já usado. Código de teste: ABCD1234EF56.", 404);
      pickupCompleted = true;
      return response({ redemption: { id: "retirada-demo", product: products[0] } });
    case "GET /store/admin/redemptions": {
      const protocol = url.searchParams.get("protocol")?.toLowerCase();
      return response({ redemptions: completedSales.filter((sale) => !protocol || [sale.protocol, sale.cartId].includes(protocol)) });
    }
    case "POST /store/admin/carts": {
      const cart = { id: crypto.randomUUID(), buyerId: body.buyerId, expiresAt: new Date(Date.now() + 86400000).toISOString(), items: [] };
      carts.set(cart.id, cart);
      return response(cart, 201);
    }
  }

  const [, , , resource, id, action] = url.pathname.split("/");
  if (resource === "products" && action === "status" && config.method === "patch") {
    allow("PrefeituraVendedor");
    if (typeof body.active !== "boolean") return fail("Informe se o item está ativo.");
    const product = products.find((item) => item.id === id);
    if (!product) return fail("Item não encontrado.", 404);
    product.active = body.active;
    return response(null, 204);
  }
  if (resource === "products" && action === "stock" && config.method === "patch") {
    const product = products.find((item) => item.id === id);
    if (!product) return fail("Item não encontrado.", 404);
    const { price, expectedPrice } = body;
    const normalize = (value: string) => value.trim().replace(",", ".");
    const valid = (value: unknown): value is string => typeof value === "string" && /^[0-9]{1,10}([.,][0-9]{1,2})?$/.test(value.trim());
    if ((price !== undefined || expectedPrice !== undefined) && (!valid(price) || !valid(expectedPrice))) {
      return fail("Informe o preço atual e o novo preço com até duas casas decimais.");
    }
    if (product.quantity !== body.expectedQuantity ||
      (expectedPrice !== undefined && Number(product.price) !== Number(normalize(expectedPrice)))) {
      return fail("O estoque ou o preço foi alterado. Confira os valores atuais antes de salvar.", 409);
    }
    product.quantity = body.quantity;
    if (price !== undefined) product.price = Number(normalize(price)).toFixed(2);
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
    if (!product || (body.quantity > 0 && (!product.active || body.quantity > product.quantity))) {
      return fail("Item indisponível ou sem estoque suficiente.", 409);
    }
    cart.items = cart.items.filter((item) => item.productId !== product.id);
    if (body.quantity > 0) cart.items.push({ productId: product.id, quantity: body.quantity, product });
    return response({ ...cart });
  }
  if (action === "checkout") {
    const buyer = [...residents.values()].find((resident) => resident.id === cart.buyerId);
    const total = cart.items.reduce((sum, item) => sum + Math.round(Number(item.product.price) * 100) * item.quantity, 0);
    if (body.expectedTotal !== undefined && body.expectedTotal !== money(total)) {
      return fail("O total do carrinho mudou. Confira o novo valor antes de confirmar a venda.", 412);
    }
    if (!buyer || buyer.balance < total || cart.items.some((item) => !item.product.active || item.quantity > item.product.quantity)) {
      return fail("Saldo ou estoque insuficiente.", 409);
    }
    buyer.balance -= total;
    cart.items.forEach(({ product, quantity }) => { product.quantity -= quantity; });
    const completedAt = now();
    const day = new Intl.DateTimeFormat("en-GB", { timeZone: "America/Sao_Paulo" }).format(new Date(completedAt)).replaceAll("/", "");
    const sequence = (saleSequences.get(day) ?? 0) + 1;
    saleSequences.set(day, sequence);
    const protocol = day + String(sequence).padStart(2, "0");
    const sellerName = "Marcos Vinícius Oliveira";
    const receipt = { saleId: cart.id, protocol, buyerName: buyer.name, sellerName, total: money(total), ecoCoinBalance: money(buyer.balance) };
    completedSales.push(...cart.items.map(({ product, quantity }) => ({
      id: crypto.randomUUID(), cartId: cart.id, protocol, user: { name: buyer.name }, sellerName, quantity, unitPrice: product.price,
      totalPrice: money(Math.round(Number(product.price) * 100) * quantity),
      completedAt, createdAt: completedAt, status: "COMPLETED" as const, product: { name: product.name },
    })));
    sales.set(id, receipt);
    carts.delete(id);
    return response(receipt, 201);
  }
  return fail("Esta operação está disponível com a API real.", 501);
};
