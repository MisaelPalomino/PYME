import axios from "axios";
import { axios_call_to_result } from "~/lib/result";

const api = axios.create({
  baseURL: "http://localhost:8000/api/informes",
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export async function getBajoStock(params?: Record<string, any>) {
  return axios_call_to_result(async () => await api.get<BajoStockItem[]>("/bajo-stock/", { params }));
}

export async function getRotacion(params?: Record<string, any>) {
  return axios_call_to_result(async () => await api.get<RotacionItem[]>("/rotacion/", { params }));
}

export async function getConsolidado() {
  return axios_call_to_result(async () => await api.get<ConsolidadoData>("/consolidado/"));
}

export async function getGraficosComprasVentas(params?: Record<string, any>) {
  return axios_call_to_result(async () => await api.get<GraficoCVItem[]>("/graficos-compras-ventas/", { params }));
}