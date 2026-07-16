import { apiClient } from "~/lib/api-client";
import { axios_call_to_result } from "~/lib/result";
import * as z from "zod";

export const CategoriaSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(255),
  descripcion: z.string().optional().default(""),
});

export type CategoriaFormData = z.infer<typeof CategoriaSchema>;

export type Categoria = {
  id_categoria: number;
  nombre: string;
  descripcion: string;
};

export type CategoriaDTO = CategoriaFormData;

export async function get_all() {
  return axios_call_to_result(async () => await apiClient.get<Categoria[]>("/api/core/categorias/"));
}

export async function get_one(id: number) {
  return axios_call_to_result(async () => await apiClient.get<Categoria>(`/api/core/categorias/${id}/`));
}

export async function create(data: CategoriaDTO) {
  return axios_call_to_result(async () => await apiClient.post<Categoria>("/api/core/categorias/", data));
}

export async function update(id: number, data: CategoriaDTO) {
  return axios_call_to_result(async () => await apiClient.put<Categoria>(`/api/core/categorias/${id}/`, data));
}

async function _delete(id: number) {
  return axios_call_to_result(async () => await apiClient.delete<unknown>(`/api/core/categorias/${id}/`));
}

export { _delete as delete };
