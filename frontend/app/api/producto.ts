import axios from "axios";
import { axios_call_to_result } from "~/lib/result";
import * as z from "zod";

const api = axios.create({
  baseURL: "http://localhost:8000/api/core",
  headers: {
    'Content-Type': 'application/json',
  },
});

// Schemas
export const ProductoRequestSchema = z.object({
  nombre: z.string().nonempty("El nombre es requerido"),
  sku: z.string().nonempty("El SKU es requerido"),
  descripcion: z.string().optional(),
  precio: z.number().positive("El precio debe ser mayor a 0"),
  stock_actual: z.number().min(0, "El stock no puede ser negativo"),
  stock_minimo: z.number().min(0, "El stock mínimo no puede ser negativo"),
  stock_maximo: z.number().min(0, "El stock máximo no puede ser negativo"),
  id_categoria: z.number().positive("La categoría es requerida"),
  id_proveedor_principal: z.number().positive("El proveedor es requerido"),
});

export type ProductoRequest = z.infer<typeof ProductoRequestSchema>;

export type ProductoResponse = {
  id_producto: number;
  nombre: string;
  sku: string;
  descripcion: string;
  precio: number;
  stock_actual: number;
  stock_minimo: number;
  stock_maximo: number;
  id_categoria: number;
  categoria_nombre: string;
  id_proveedor_principal: number;
  proveedor_nombre: string;
  estado: "critical" | "warning" | "normal";
};

export type ProductoListResponse = ProductoResponse[];

// API functions
export async function getProductos(params?: Record<string, any>) {
  return axios_call_to_result(async () => await api.get<ProductoListResponse>("/productos/", { params }));
}

export async function getProducto(id: number) {
  return axios_call_to_result(async () => await api.get<ProductoResponse>(`/productos/${id}/`));
}

export async function createProducto(data: ProductoRequest) {
  return axios_call_to_result(async () => await api.post<ProductoResponse>("/productos/", data));
}

export async function updateProducto(id: number, data: Partial<ProductoRequest>) {
  return axios_call_to_result(async () => await api.put<ProductoResponse>(`/productos/${id}/`, data));
}

export async function deleteProducto(id: number) {
  return axios_call_to_result(async () => await api.delete(`/productos/${id}/`));
}