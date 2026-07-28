import { z } from "zod";

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Informe a senha atual"),
  newPassword: z.string().min(8, "Use no mínimo 8 caracteres").regex(/[A-Z]/, "Inclua uma letra maiúscula").regex(/[a-z]/, "Inclua uma letra minúscula").regex(/\d/, "Inclua um número").regex(/[^A-Za-z0-9]/, "Inclua um caractere especial"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, { path: ["confirmPassword"], message: "As senhas não conferem" });

export type ChangePasswordInput = z.input<typeof changePasswordSchema>;

export const profileDataSchema = z.object({
  phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Telefone inválido"),
  gender: z.string().min(1, "Selecione o sexo"),
  cep: z.string().regex(/^\d{5}-\d{3}$/, "CEP inválido"),
  address: z.string().trim().min(3, "Informe o endereço"),
  number: z.string().trim().min(1, "Informe o número"),
  complement: z.string().trim().optional(),
  district: z.string().trim().min(2, "Informe o bairro"),
  city: z.string().trim().min(2, "Informe a cidade"),
  state: z.string().regex(/^[A-Z]{2}$/, "Use a sigla com 2 letras"),
});

export type ProfileDataInput = z.input<typeof profileDataSchema>;
