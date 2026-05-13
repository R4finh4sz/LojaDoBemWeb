import { z } from "zod";

export const forgotPasswordEmailSchema = z.object({
  email: z
    .string()
    .email("Insira um e-mail válido")
    .min(1, "E-mail é obrigatório"),
});

export type ForgotPasswordEmailInput = z.infer<
  typeof forgotPasswordEmailSchema
>;

export const forgotPasswordCodeSchema = z.object({
  code: z
    .string()
    .min(6, "O código deve ter 6 dígitos")
    .max(6, "O código deve ter 6 dígitos")
    .regex(/^\d+$/, "O código deve conter apenas números"),
});

export type ForgotPasswordCodeInput = z.infer<typeof forgotPasswordCodeSchema>;

export const forgotPasswordResetSchema = z
  .object({
    password: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "A senha deve conter letras maiúsculas, minúsculas e números",
      ),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type ForgotPasswordResetInput = z.infer<
  typeof forgotPasswordResetSchema
>;
