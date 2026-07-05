import { z } from "zod";

export const ProductoSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(255),
  sku: z.string().min(1, "El SKU es obligatorio").max(255),
  descripcion: z.string().optional(),
  // Coerción para asegurar compatibilidad con el DecimalField de Django
  precio: z.coerce.number().positive("El precio debe ser mayor a 0"),
  stock_actual: z.coerce.number().int(),
  stock_minimo: z.coerce.number().int(),
  stock_maximo: z.coerce.number().int(),
  id_categoria: z.coerce.number().int("Selecciona una categoría"),
  id_proveedor_principal: z.coerce.number().int("Selecciona un proveedor"),
});

export type ProductoFormData = z.infer<typeof ProductoSchema>;