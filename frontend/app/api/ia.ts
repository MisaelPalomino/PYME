import axios from "axios";
import { axios_call_to_result } from "~/lib/result";

const api = axios.create({
  baseURL: "http://localhost:8000/api/ia",
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
  return axios_call_to_result(async () => await api.get<Prediccion[]>("/predicciones/"));
}

export async function generar_todos() {
  return axios_call_to_result(async () => await api.post<GenerarTodosResponse>("/predicciones/generar-todos/"));
}
