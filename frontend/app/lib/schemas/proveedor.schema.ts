import { z } from "zod";

export const ProveedorSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(255),
  contacto: z.string().min(1, "El contacto es obligatorio").max(255),
  correo: z.string().email("El correo no es válido").max(255),
  telefono: z.string().min(1, "El teléfono es obligatorio").max(255),
  lead_time_dias: z.coerce.number().int().min(1, "El tiempo de entrega debe ser mayor a 0"),
  activo: z.coerce.boolean().default(true),
});

export type ProveedorFormData = z.infer<typeof ProveedorSchema>;
