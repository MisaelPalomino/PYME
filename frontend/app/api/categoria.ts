import axios from "axios";
import { axios_call_to_result } from "~/lib/result";
import * as z from "zod";

const api = axios.create({
  baseURL: "http://localhost:8000/api/core",
  headers: {
    'Content-Type': 'application/json',
  },
});

export const CategoriaRequestSchema = z.object({
  nombre: z.string().nonempty("El nombre es requerido"),
  descripcion: z.string().optional(),
});

export type CategoriaRequest = z.infer<typeof CategoriaRequestSchema>;

export type CategoriaResponse = {
  id_categoria: number;
  nombre: string;
  descripcion: string;
};

export type CategoriaListResponse = CategoriaResponse[];

export async function getCategorias() {
  return axios_call_to_result(async () => await api.get<CategoriaListResponse>("/categorias/"));
}

export async function getCategoria(id: number) {
  return axios_call_to_result(async () => await api.get<CategoriaResponse>(`/categorias/${id}/`));
}

export async function createCategoria(data: CategoriaRequest) {
  return axios_call_to_result(async () => await api.post<CategoriaResponse>("/categorias/", data));
}

export async function updateCategoria(id: number, data: Partial<CategoriaRequest>) {
  return axios_call_to_result(async () => await api.put<CategoriaResponse>(`/categorias/${id}/`, data));
}

export async function deleteCategoria(id: number) {
  return axios_call_to_result(async () => await api.delete(`/categorias/${id}/`));
}