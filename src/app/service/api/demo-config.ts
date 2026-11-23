export const demoEnabled = process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const demoPassword = "Demo1234!";
export const demoCode = "123456";
export const demoCpf = "529.982.247-25";

export const demoAccounts = [
  { label: "Master", email: "master@demo.test", role: "MASTER" },
  { label: "Prefeitura", email: "prefeitura@demo.test", role: "PrefeituraVendedor" },
  { label: "Cooperativa", email: "cooperativa@demo.test", role: "COOPERATIVA" },
] as const;
