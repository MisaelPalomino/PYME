import { z } from "zod";

export const CategoriaSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(255),
  descripcion: z.string().optional().default(""),
});

export type CategoriaFormData = z.infer<typeof CategoriaSchema>;
