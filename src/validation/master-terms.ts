import { z } from "zod";

export const masterTermsSchema = z.object({
  title: z.string().trim().min(5, "Informe um título com pelo menos 5 caracteres"),
  content: z.string().trim().min(30, "O texto deve ter pelo menos 30 caracteres"),
  audience: z.enum(["user", "admin"], { message: "Selecione para quem os termos se aplicam" }),
});

export type MasterTermsInput = z.input<typeof masterTermsSchema>;
