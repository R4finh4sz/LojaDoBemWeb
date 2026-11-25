import { z } from "zod";

const digits = (value: string) => value.replace(/\D/g, "");

export const isValidCpf = (value: string) => {
  const cpf = digits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const digit = (length: number) => {
    const sum = cpf.slice(0, length).split("").reduce((total, number, index) => total + Number(number) * (length + 1 - index), 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
};

export function isMunicipalAge(value: string) {
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value)) return false;
  const birthDate = new Date(value + "T00:00:00Z");
  if (!Number.isFinite(birthDate.getTime()) || birthDate.toISOString().slice(0, 10) !== value) return false;
  const [day, month, year] = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" })
    .format(new Date()).split("/").map(Number);
  const birthdayPassed = month * 32 + day >= (birthDate.getUTCMonth() + 1) * 32 + birthDate.getUTCDate();
  const age = year - birthDate.getUTCFullYear() - (birthdayPassed ? 0 : 1);
  return age >= 18 && age <= 90;
}

export const citizenRegistrationSchema = z.object({
  fullName: z.string().trim().min(3, "Informe o nome completo").refine((value) => value.includes(" "), "Informe nome e sobrenome"),
  cpf: z.string().refine(isValidCpf, "CPF inválido"),
  birthDate: z.string().min(1, "Informe a data de nascimento").refine(isMunicipalAge, "A idade deve ser de 18 a 90 anos"),
  zipCode: z.string().regex(/^\d{5}-\d{3}$/, "CEP inválido"),
  address: z.string().trim().min(3, "Informe o endereço"),
  addressNumber: z.string().trim().min(1, "Informe o número").max(30),
  email: z.email("Informe um e-mail válido"),
});

export type CitizenRegistrationInput = z.input<typeof citizenRegistrationSchema>;
