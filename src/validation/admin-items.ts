import { z } from "zod";

export const itemSchema = z.object({
  name: z.string().trim().min(3, "Informe o nome do item"),
  description: z.string().trim().min(10, "Descreva o item com pelo menos 10 caracteres"),
  category: z.string().min(1, "Selecione uma categoria"),
  points: z.string().regex(/^[1-9]\d*$/, "Informe uma pontuação inteira e positiva"),
  stock: z.string().regex(/^\d+$/, "Informe uma quantidade inteira válida"),
});

export type ItemInput = z.input<typeof itemSchema>;

export const editItemSchema = itemSchema.omit({ name: true });
export type EditItemInput = z.input<typeof editItemSchema>;
