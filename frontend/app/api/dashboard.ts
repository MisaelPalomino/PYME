import axios from "axios";
import { axios_call_to_result } from "~/lib/result";

const api = axios.create({
  baseURL: "http://localhost:8000/api/dashboard",
  headers: {
    'Content-Type': 'application/json',
  },
});

export type Response = {
  ventas_diarias: {
    dia: Date,
    monto: number,
    unidades: number,
  }[],
  resumen: {
    ventas_mes: {
      monto: number,
      unidades: number
    },
    ventas_semana: {
      monto: number,
      unidades: number
    },
    alertas_totales: number,
    total_productos: number,
    alertas_no_leidas: number, // TODO: Will it work?
    pedidos_pendientes: number,
    pedidos_en_transito: number,
    productos_sin_stock: number,
    productos_bajo_stock: number,
    notificaciones_no_leidas: number,
  },
  generado_en: Date,
  stock_critico: {
    sku: string,
    nombre: string,
    categoria: string,
    id_producto: number,
    estado_stock: string,
    stock_actual: number,
    stock_maximo: number,
    stock_minimo: number,
    lead_time_dias: number,
    proveedor_principal: string
  }[],
  alertas_activas: {
    sku: string,
    mensaje: string,
    id_alerta: number,
    id_producto: number,
    tipo_alerta: "sin_stock" | "stock_bajo",
    stock_actual: number,
    stock_minimo: number,
    fecha_creacion: Date,
    producto_nombre: string
  }[]
};

export async function dashboard() {
  return axios_call_to_result(async () => await api.get<Response>("/dashboard/"));
}
