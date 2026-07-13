import axios from "axios";
import { axios_call_to_result } from "~/lib/result";
import * as z from "zod";

const api = axios.create({
  baseURL: "http://localhost:8000/api/core",
  headers: {
    'Content-Type': 'application/json',
  },
});

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
}

export async function get_all() {
  return axios_call_to_result(async () => await api.get<Producto[]>("/productos/"))
}

/*
export const productosAPI = {
  getAll: async (params: Record<string, any> = {}) => {
    return await api.get<Producto[]>('/core/productos/', { params });
  },
  getOne: async (id: number) => {
    return await api.get<Producto>(`/core/productos/${id}/`);
  },
  create: async (data: ProductoDTO) => {
    return await api.post('/core/productos/', data);
  },
  update: async (id: number, data: any) => {
    return await api.put<Producto>(`/core/productos/${id}/`, data);
  },
  delete: async (id: number) => {
    return await api.delete(`/core/productos/${id}/`);
  },
};
*/
