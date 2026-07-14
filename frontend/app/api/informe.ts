import axios from "axios";
import { axios_call_to_result } from "~/lib/result";

const api = axios.create({
  baseURL: "http://localhost:8000/api/informes",
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const sessionStr = localStorage.getItem("session");
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session?.access) {
          config.headers.Authorization = `Bearer ${session.access}`;
        }
      } catch (e) {
        console.error('Error parsing session', e);
      }
    }
  }
  return config;
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

export async function get_bajo_stock(params: Record<string, string | number | boolean | undefined> = {}) {
  return axios_call_to_result(async () => await api.get<BajoStockItem[]>("/bajo-stock/", { params }));
}

export async function get_rotacion(params: Record<string, string | number | boolean | undefined> = {}) {
  return axios_call_to_result(async () => await api.get<RotacionItem[]>("/rotacion/", { params }));
}

export async function get_consolidado() {
  return axios_call_to_result(async () => await api.get<ConsolidadoData>("/consolidado/"));
}

export async function get_graficos_compras_ventas(params: Record<string, string | number | boolean | undefined> = {}) {
  return axios_call_to_result(async () => await api.get<GraficoCVItem[]>("/graficos-compras-ventas/", { params }));
}
