import { apiClient } from "~/lib/api-client";
import { axios_call_to_result } from "~/lib/result";

export type Prediccion = {
  producto_id: number;
  producto_nombre: string;
  sku: string;
  stock_actual: number;
  prediccion_7d: number | null;
  prediccion_14d: number | null;
  prediccion_21d: number | null;
  mae?: number | null;
  mape?: number | null;
};

export type GenerarTodosResponse = {
  total_productos: number;
  procesados: number;
  resultados: Array<{
    producto_id: number;
    producto_nombre: string;
    estado: string;
    mensaje?: string;
    mae?: number;
    mape?: number;
    n_muestras?: number;
    error?: string;
  }>;
};

export async function get_all() {
  return axios_call_to_result(async () => await apiClient.get<Prediccion[]>("/api/ia/predicciones/"));
}

export async function generar_todos() {
  return axios_call_to_result(async () => await apiClient.post<GenerarTodosResponse>("/api/ia/predicciones/generar-todos/"));
}
