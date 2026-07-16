import { apiClient } from "~/lib/api-client";
import { axios_call_to_result } from "~/lib/result";
import * as z from "zod";

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

export type MovimientoFormData = z.infer<typeof MovimientoSchema>;

export type Movimiento = {
  id: number;
  producto_nombre: string;
  tipo_movimiento: "Entrada" | "Salida";
  fecha: Date;
  cantidad: number;
  observaciones: string;
  id_producto?: number;
};

export type MovimientoDTO = MovimientoFormData & {
  id_usuario?: number;
};

type BackendMovimiento = {
  id_movimiento: number;
  producto_nombre: string;
  tipo_movimiento: string;
  fecha: string;
  cantidad: number;
  observaciones: string;
  id_producto: number;
};

export async function get_all(params: Record<string, string | number | boolean | undefined> = {}) {
  const result = await axios_call_to_result(async () => await apiClient.get<BackendMovimiento[]>("/api/movimientos/", { params }));
  if (result.ok) {
    const mapped: Movimiento[] = result.data.map((m: BackendMovimiento) => ({
      id: m.id_movimiento,
      producto_nombre: m.producto_nombre || '',
      tipo_movimiento: (m.tipo_movimiento === 'entrada' || m.tipo_movimiento === 'Entrada') ? 'Entrada' as const : 'Salida' as const,
      fecha: new Date(m.fecha),
      cantidad: m.cantidad,
      observaciones: m.observaciones || '',
      id_producto: m.id_producto,
    }));
    return { ok: true as const, data: mapped };
  }
  return result;
}

export async function get_historial_por_producto(id_producto: number) {
  const result = await axios_call_to_result(async () => await apiClient.get<BackendMovimiento[]>(`/api/movimientos/producto/${id_producto}/`));
  if (result.ok) {
    const mapped: Movimiento[] = result.data.map((m: BackendMovimiento) => ({
      id: m.id_movimiento,
      producto_nombre: m.producto_nombre || '',
      tipo_movimiento: (m.tipo_movimiento === 'entrada' || m.tipo_movimiento === 'Entrada') ? 'Entrada' as const : 'Salida' as const,
      fecha: new Date(m.fecha),
      cantidad: m.cantidad,
      observaciones: m.observaciones || '',
      id_producto: m.id_producto,
    }));
    return { ok: true as const, data: mapped };
  }
  return result;
}

export async function create(data: MovimientoDTO) {
  const backendData = {
    tipo_movimiento: data.tipo_movimiento.toLowerCase(),
    cantidad: Number(data.cantidad),
    observaciones: data.observaciones || '',
    id_producto: Number(data.id_producto),
    id_usuario: data.id_usuario ? Number(data.id_usuario) : undefined,
  };
  return axios_call_to_result(async () => await apiClient.post<unknown>("/api/movimientos/", backendData));
}
