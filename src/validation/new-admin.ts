import { z } from "zod";
import { isMunicipalAge, isValidCpf } from "./citizen-registration";
import { normalizeCnpj } from "@/utils/input-masks";

export function isValidCnpj(value: string) {
  const cnpj = normalizeCnpj(value);
  if (!/^[A-Z0-9]{12}[0-9]{2}$/.test(cnpj) || cnpj === cnpj[0].repeat(14)) return false;
  const digit = (weights: number[]) => {
    const remainder = weights.reduce((sum, weight, index) => sum + (cnpj.charCodeAt(index) - 48) * weight, 0) % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  return digit([5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(cnpj[12]) &&
    digit([6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(cnpj[13]);
}

const operatorFields = z.object({
  nome: z.string().trim().min(2, "Informe o nome completo").max(100),
  email: z.email("Informe um e-mail válido"),
  cpf: z.string().refine(isValidCpf, "CPF inválido"),
  dataNascimento: z.string().refine(
    (value) => isMunicipalAge(value.split("/").reverse().join("-")),
    "Informe uma data válida para a idade de 18 a 90 anos",
  ),
  endereco: z.string().trim().min(3, "Informe o endereço"),
  cep: z.string().regex(/^\d{5}-\d{3}$/, "CEP inválido"),
  cidade: z.string().trim().min(2, "Informe a cidade"),
  estado: z.string().regex(/^[A-Za-z]{2}$/, "Use a sigla com 2 letras"),
  telefone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Telefone inválido"),
});

export const newAdminSchema = operatorFields.extend({
  cnpj: z.string(),
});

export type NewAdminInput = z.input<typeof newAdminSchema>;

export const operatorSchema = (cooperative: boolean) => newAdminSchema.refine(
  (data) => cooperative || isValidCnpj(data.cnpj),
  { path: ["cnpj"], message: "CNPJ inválido" },
);
