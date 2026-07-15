import axios from "axios";
import { axios_call_to_result } from "~/lib/result";
import * as z from "zod";

const api = axios.create({
  baseURL: "http://localhost:8000/api/proveedores",
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ProveedorRequestSchema = z.object({
  nombre: z.string().nonempty("El nombre es requerido"),
  contacto: z.string().optional(),
  correo: z.string().email("El correo no es válido"),
  telefono: z.string().optional(),
  lead_time_dias: z.number().min(0, "El lead time no puede ser negativo"),
  activo: z.boolean().optional().default(true),
});

export type ProveedorRequest = z.infer<typeof ProveedorRequestSchema>;

export type ProveedorResponse = {
  id_proveedor: number;
  nombre: string;
  contacto: string;
  correo: string;
  telefono: string;
  lead_time_dias: number;
  activo: boolean;
};

export type ProveedorListResponse = ProveedorResponse[];

export async function getProveedores() {
  return axios_call_to_result(async () => await api.get<ProveedorListResponse>("/proveedores/"));
}

export async function getProveedor(id: number) {
  return axios_call_to_result(async () => await api.get<ProveedorResponse>(`/proveedores/${id}/`));
}

export async function createProveedor(data: ProveedorRequest) {
  return axios_call_to_result(async () => await api.post<ProveedorResponse>("/proveedores/", data));
}

export async function updateProveedor(id: number, data: Partial<ProveedorRequest>) {
  return axios_call_to_result(async () => await api.put<ProveedorResponse>(`/proveedores/${id}/`, data));
}

export async function deleteProveedor(id: number) {
  return axios_call_to_result(async () => await api.delete(`/proveedores/${id}/`));
}