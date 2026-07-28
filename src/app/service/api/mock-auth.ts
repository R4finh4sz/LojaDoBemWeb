import type { LoginInput } from "@/validation/login";

export type MockRole = "master" | "admin";

const mockUsers = {
  "master@recicla.com": { password: "master123", name: "Marina Master", roleId: 4 },
  "admin@recicla.com": { password: "admin123", name: "André Admin", roleId: 5 },
} as const;

const createMockJwt = (roleId: number) => {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  return `${encode({ alg: "none", typ: "JWT" })}.${encode({ roleId, exp: Math.floor(Date.now() / 1000) + 28800 })}.mock`;
};

export const mockCredentials = {
  master: { email: "master@recicla.com", password: "master123" },
  admin: { email: "admin@recicla.com", password: "admin123" },
} satisfies Record<MockRole, Pick<LoginInput, "email" | "password">>;

export const mockLogin = async (form: LoginInput) => {
  await new Promise((resolve) => setTimeout(resolve, 450));
  const user = mockUsers[form.email.toLowerCase() as keyof typeof mockUsers];

  if (!user || user.password !== form.password) {
    throw new Error("Credenciais inválidas. Use um dos acessos de demonstração.");
  }

  return {
    jwt: createMockJwt(user.roleId),
    roleId: user.roleId,
    userName: user.name,
    userEmail: form.email,
    requiresTwoFactor: false,
  };
};
