import { apiClient } from "~/lib/api-client";
import { axios_call_to_result } from "~/lib/result";

export type BajoStockItem = {
  id_producto: number;
  nombre: string;
  sku: string;
  categoria: string;
  stock_actual: number;
  stock_minimo: number;
  deficit: number;
  lead_time_dias: number;
  estado: string;
};

export type RotacionItem = {
  id_producto: number;
  nombre: string;
  sku: string;
  ventas_periodo: number;
  stock_promedio: number;
  indice_rotacion: string | null;
};

export type ConsolidadoData = {
  resumen: {
    productos_bajo_stock: number;
    alertas_criticas_ia: number;
    mae_promedio: string | null;
    mape_promedio: string | null;
  };
  ultimas_semanas: {
    periodo: string;
    ventas: string;
    compras: string;
  }[];
  metricas_por_producto: {
    id_producto: number;
    nombre: string;
    mae: string | null;
    mape: string | null;
    estado_modelo: string | null;
    alerta: string;
  }[];
};

export type GraficoCVItem = {
  periodo: string;
  ventas: string;
  compras: string;
};

export async function get_bajo_stock(params: Record<string, string | number | boolean | undefined> = {}) {
  return axios_call_to_result(async () => await apiClient.get<BajoStockItem[]>("/api/informes/bajo-stock/", { params }));
}

export async function get_rotacion(params: Record<string, string | number | boolean | undefined> = {}) {
  return axios_call_to_result(async () => await apiClient.get<RotacionItem[]>("/api/informes/rotacion/", { params }));
}

export async function get_consolidado() {
  return axios_call_to_result(async () => await apiClient.get<ConsolidadoData>("/api/informes/consolidado/"));
}

export async function get_graficos_compras_ventas(params: Record<string, string | number | boolean | undefined> = {}) {
  return axios_call_to_result(async () => await apiClient.get<GraficoCVItem[]>("/api/informes/graficos-compras-ventas/", { params }));
}

export type InformeTipo = "bajo-stock" | "rotacion" | "consolidado" | "graficos-compras-ventas";

export async function exportarInforme(
  tipo: InformeTipo,
  formato: "pdf" | "excel",
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<Blob> {
  const response = await apiClient.get(`/api/informes/${tipo}/`, {
    params: { ...params, formato },
    responseType: "blob",
  });
  return response.data;
}

export function descargarBlob(blob: Blob, nombreArchivo: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
