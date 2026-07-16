import { apiClient } from "~/lib/api-client";
import { axios_call_to_result } from "~/lib/result";
import * as z from "zod";

export const ProveedorSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(255),
  contacto: z.string().min(1, "El contacto es obligatorio").max(255),
  correo: z.string().email("El correo no es válido").max(255),
  telefono: z.string().min(1, "El teléfono es obligatorio").max(255),
  lead_time_dias: z.coerce.number().int().min(1, "El tiempo de entrega debe ser mayor a 0"),
  activo: z.coerce.boolean().default(true),
});

export type ProveedorFormData = z.infer<typeof ProveedorSchema>;

export type Proveedor = {
  id_proveedor: number;
  nombre: string;
  contacto: string;
  correo: string;
  telefono: string;
  lead_time_dias: number;
  activo: boolean;
  porcentaje_cumplimiento: number;
  categorias: {
    nombre: string;
    id_categoria: number;
  }[];
};

export type ProveedorDTO = ProveedorFormData;

export async function get_all() {
  return axios_call_to_result(async () => await apiClient.get<Proveedor[]>("/api/proveedores/"));
}

export async function get_one(id: number) {
  return axios_call_to_result(async () => await apiClient.get<Proveedor>(`/api/proveedores/${id}/`));
}

export async function create(data: ProveedorDTO) {
  return axios_call_to_result(async () => await apiClient.post<Proveedor>("/api/proveedores/", data));
}

export async function update(id: number, data: ProveedorDTO) {
  return axios_call_to_result(async () => await apiClient.put<Proveedor>(`/api/proveedores/${id}/`, data));
}

async function _delete(id: number) {
  return axios_call_to_result(async () => await apiClient.delete<unknown>(`/api/proveedores/${id}/`));
}

export { _delete as delete };
