import { z } from "zod";

export const PedidoSchema = z.object({
  id_proveedor: z.coerce.number().min(1, "El proveedor es requerido"),
  id_producto: z.coerce.number().min(1, "El producto es requerido"),
  cantidad: z.coerce.number().min(1, "La cantidad debe ser al menos 1"),
  precio_unitario: z.coerce.number().min(0.01, "El precio unitario debe ser mayor a 0"),
});

export type PedidoFormValues = z.infer<typeof PedidoSchema>;
