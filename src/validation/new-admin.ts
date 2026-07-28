import { z } from "zod";

const digits = (value: string) => value.replace(/\D/g, "");

const isValidCpf = (value: string) => {
  const cpf = digits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const calculate = (length: number) => {
    const sum = cpf.slice(0, length).split("").reduce((total, digit, index) => total + Number(digit) * (length + 1 - index), 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  return calculate(9) === Number(cpf[9]) && calculate(10) === Number(cpf[10]);
};

const isValidCnpj = (value: string) => {
  const cnpj = digits(value);
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  const calculate = (length: 12 | 13) => {
    const weights = length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = cnpj.slice(0, length).split("").reduce((total, digit, index) => total + Number(digit) * weights[index], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  return calculate(12) === Number(cnpj[12]) && calculate(13) === Number(cnpj[13]);
};

const parseBirthDate = (value: string) => {
  const [day, month, year] = value.split("/").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
};

export const newAdminSchema = z.object({
  nome: z.string().trim().min(3, "Informe o nome completo").refine((value) => value.includes(" "), "Informe nome e sobrenome"),
  responsavel: z.string().trim().min(3, "Informe o responsável pelo login").refine((value) => value.includes(" "), "Informe nome e sobrenome do responsável"),
  cnpj: z.string().refine(isValidCnpj, "CNPJ inválido"),
  email: z.email("Informe um e-mail válido"),
  password: z.string().min(8, "Use no mínimo 8 caracteres").regex(/[A-Z]/, "Inclua uma letra maiúscula").regex(/[a-z]/, "Inclua uma letra minúscula").regex(/\d/, "Inclua um número").regex(/[^A-Za-z0-9]/, "Inclua um caractere especial"),
  confirmPassword: z.string(),
  cpf: z.string().refine(isValidCpf, "CPF inválido"),
  dataNascimento: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Use DD/MM/AAAA").refine((value) => parseBirthDate(value) !== null, "Data inválida").refine((value) => {
    const date = parseBirthDate(value);
    if (!date) return false;
    const adultDate = new Date();
    adultDate.setFullYear(adultDate.getFullYear() - 18);
    return date <= adultDate;
  }, "O administrador deve ter pelo menos 18 anos"),
  endereco: z.string().trim().min(3, "Informe o endereço"),
  bairro: z.string().trim().min(2, "Informe o bairro"),
  numero: z.string().trim().min(1, "Informe o número"),
  complemento: z.string().trim().optional(),
  cep: z.string().regex(/^\d{5}-\d{3}$/, "CEP inválido"),
  cidade: z.string().trim().min(2, "Informe a cidade"),
  estado: z.string().regex(/^[A-Za-z]{2}$/, "Use a sigla com 2 letras"),
  telefone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Telefone inválido"),
}).refine((data) => data.password === data.confirmPassword, { path: ["confirmPassword"], message: "As senhas não conferem" });

export type NewAdminInput = z.input<typeof newAdminSchema>;
