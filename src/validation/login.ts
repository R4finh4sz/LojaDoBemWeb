import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Insira um e-mail válido")
    .min(1, "E-mail é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginInput = z.input<typeof loginSchema>;
