import axios from "axios";
import { axios_call_to_result } from "~/lib/result";
import * as z from "zod";

const api = axios.create({
  baseURL: "http://localhost:8000/api/core",
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

export const ProductoSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(255),
  sku: z.string().min(1, "El SKU es obligatorio").max(255),
  descripcion: z.string().optional(),
  precio: z.coerce.number().positive("El precio debe ser mayor a 0"),
  stock_actual: z.coerce.number().int(),
  stock_minimo: z.coerce.number().int(),
  stock_maximo: z.coerce.number().int(),
  id_categoria: z.coerce.number().int("Selecciona una categoría"),
  id_proveedor_principal: z.coerce.number().int("Selecciona un proveedor"),
});

export type ProductoFormData = z.infer<typeof ProductoSchema>;

export type Producto = {
  id_producto: number;
  nombre: string;
  sku: string;
  descripcion: string;
  precio: number;
  estado: "normal" | "warning" | "critical";
  stock_actual: number;
  stock_minimo: number;
  stock_maximo: number;
  id_categoria: number;
  categoria_nombre: string;
  id_proveedor_principal: number;
  proveedor_nombre: string;
};

export type ProductoDTO = ProductoFormData;

export async function get_all() {
  return axios_call_to_result(async () => await api.get<Producto[]>("/productos/"));
}

export async function get_one(id: number) {
  return axios_call_to_result(async () => await api.get<Producto>(`/productos/${id}/`));
}

export async function create(data: ProductoDTO) {
  return axios_call_to_result(async () => await api.post<Producto>("/productos/", data));
}

export async function update(id: number, data: ProductoDTO) {
  return axios_call_to_result(async () => await api.put<Producto>(`/productos/${id}/`, data));
}

async function _delete(id: number) {
  return axios_call_to_result(async () => await api.delete<unknown>(`/productos/${id}/`));
}

export { _delete as delete };
