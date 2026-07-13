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
  return axios_call_to_result(async () => await api.get<Categoria[]>("/categorias/"));
}

export async function get_one(id: number) {
  return axios_call_to_result(async () => await api.get<Categoria>(`/categorias/${id}/`));
}

export async function create(data: CategoriaDTO) {
  return axios_call_to_result(async () => await api.post<Categoria>("/categorias/", data));
}

export async function update(id: number, data: CategoriaDTO) {
  return axios_call_to_result(async () => await api.put<Categoria>(`/categorias/${id}/`, data));
}

async function _delete(id: number) {
  return axios_call_to_result(async () => await api.delete<unknown>(`/categorias/${id}/`));
}

export { _delete as delete };
