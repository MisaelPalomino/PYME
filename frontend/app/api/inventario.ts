import { apiClient } from "~/lib/api-client";
import { axios_call_to_result } from "~/lib/result";

export type InventarioProducto = {
  id_producto: number;
  nombre: string;
  stock_actual: number;
  estado_stock: string;
};

export type Inventario = {
  total: number;
  stock_agotado: number;
  stock_critico: number;
  stock_normal: number;
  productos: InventarioProducto[];
};

export type HistorialProducto = {
  id_producto: number;
  historial: {
    fecha: string;
    tipo_movimiento: "salida" | "entrada";
    cantidad: number;
    observaciones: string;
  }[];
};

export async function get_all() {
  return axios_call_to_result(async () => await apiClient.get<Inventario>("/api/inventario/stock/"));
}

export async function get_history(id_producto: number) {
  return axios_call_to_result(async () => await apiClient.get<HistorialProducto>(`/api/inventario/historial/${id_producto}/`));
}
