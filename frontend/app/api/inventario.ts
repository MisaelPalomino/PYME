import axios from "axios";
import { axios_call_to_result } from "~/lib/result";

const api = axios.create({
  baseURL: "http://localhost:8000/api/inventario",
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
  return axios_call_to_result(async () => await api.get<Inventario>("/stock/"));
}

export async function get_history(id_producto: number) {
  return axios_call_to_result(async () => await api.get<HistorialProducto>(`/historial/${id_producto}/`));
}
