import { z } from "zod";

export const MovimientoSchema = z.object({
  tipo_movimiento: z.enum(["Entrada", "Salida", "entrada", "salida"], {
    message: "El tipo de movimiento debe ser Entrada o Salida."
  }),
  cantidad: z.preprocess(
    (val) => Number(val),
    z.number().int({ message: "La cantidad debe ser un número entero." }).positive({ message: "La cantidad debe ser mayor a cero." })
  ),
  id_producto: z.preprocess(
    (val) => Number(val),
    z.number().int().positive({ message: "Debe seleccionar un producto válido." })
  ),
  observaciones: z.string().optional()
});
