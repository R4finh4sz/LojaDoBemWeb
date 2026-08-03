import { z } from "zod";

const digits = (value: string) => value.replace(/\D/g, "");

const isValidCpf = (value: string) => {
  const cpf = digits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const digit = (length: number) => {
    const sum = cpf.slice(0, length).split("").reduce((total, number, index) => total + Number(number) * (length + 1 - index), 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
};

const isAdult = (value: string) => {
  const birthDate = new Date(`${value}T12:00:00`);
  if (Number.isNaN(birthDate.getTime())) return false;
  const limit = new Date();
  limit.setFullYear(limit.getFullYear() - 18);
  return birthDate <= limit;
};

export const citizenRegistrationSchema = z.object({
  fullName: z.string().trim().min(3, "Informe o nome completo").refine((value) => value.includes(" "), "Informe nome e sobrenome"),
  cpf: z.string().refine(isValidCpf, "CPF inválido"),
  birthDate: z.string().min(1, "Informe a data de nascimento").refine(isAdult, "O munícipe deve ter pelo menos 18 anos"),
  phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Telefone inválido"),
  zipCode: z.string().regex(/^\d{5}-\d{3}$/, "CEP inválido"),
  address: z.string().trim().min(3, "Informe o endereço"),
  addressComplement: z.string().trim().optional(),
  city: z.string().trim().min(2, "Informe a cidade"),
  state: z.string().regex(/^[A-Z]{2}$/, "Use a sigla do estado"),
  email: z.email("Informe um e-mail válido"),
});

export type CitizenRegistrationInput = z.input<typeof citizenRegistrationSchema>;
