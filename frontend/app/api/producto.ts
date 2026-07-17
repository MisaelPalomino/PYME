import { apiClient } from "~/lib/api-client";
import { axios_call_to_result } from "~/lib/result";
import * as z from "zod";

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
  return axios_call_to_result(async () => await apiClient.get<Producto[]>("/api/core/productos/"));
}

export async function get_one(id: number) {
  return axios_call_to_result(async () => await apiClient.get<Producto>(`/api/core/productos/${id}/`));
}

export async function create(data: ProductoDTO) {
  return axios_call_to_result(async () => await apiClient.post<Producto>("/api/core/productos/", data));
}

export async function update(id: number, data: ProductoDTO) {
  return axios_call_to_result(async () => await apiClient.put<Producto>(`/api/core/productos/${id}/`, data));
}

async function _delete(id: number) {
  return axios_call_to_result(async () => await apiClient.delete<unknown>(`/api/core/productos/${id}/`));
}

export { _delete as delete };
