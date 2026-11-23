import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Insira um e-mail válido")
    .min(1, "E-mail é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória").max(128, "Senha muito longa"),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginInput = z.input<typeof loginSchema>;
