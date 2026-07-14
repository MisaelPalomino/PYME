import axios from "axios";
import { axios_call_to_result } from "~/lib/result";
import { z } from "zod";

const api = axios.create({
  baseURL: "http://localhost:8000/api/auth",
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

export const RoleEnum = z.enum(['Administrador', 'Gerente', 'Almacenero', 'Comprador'], {
  message: "Debe seleccionar un rol válido."
});

export type Role = z.infer<typeof RoleEnum>;

export const UsuarioSchema = z.object({
  name: z.string().trim().min(3, { message: "El nombre completo debe tener al menos 3 caracteres" }),
  email: z.string().trim().email({ message: "El correo electrónico no es válido" }),
  role: RoleEnum,
  active: z.preprocess(
    (val) => {
      if (typeof val === 'string') return val === 'true';
      if (typeof val === 'boolean') return val;
      return true;
    },
    z.boolean()
  ).optional()
});

export type UsuarioFormData = z.infer<typeof UsuarioSchema>;

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: Date;
  lastLogin: Date;
};

export type UserItemBackend = {
  id_usuario: number;
  username: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  fecha_creacion: string;
};

export type UsuarioDTO = {
  username: string;
  nombre: string;
  email: string;
  rol: string;
  activo?: boolean;
  password?: string;
  password2?: string;
};

export function mapBackendUserToFrontend(u: UserItemBackend): User {
  return {
    id: u.id_usuario.toString(),
    name: u.nombre,
    email: u.email,
    role: u.rol as Role,
    active: u.activo,
    createdAt: new Date(u.fecha_creacion),
    lastLogin: new Date(u.fecha_creacion)
  };
}

export async function get_all() {
  const result = await axios_call_to_result(async () => await api.get<UserItemBackend[]>("/usuarios/"));
  if (result.ok) {
    return { ok: true as const, data: result.data.map(mapBackendUserToFrontend) };
  }
  return result;
}

export async function get_one(id: number) {
  return axios_call_to_result(async () => await api.get<UserItemBackend>(`/usuarios/${id}/`));
}

export async function create(data: UsuarioDTO) {
  return axios_call_to_result(async () => await api.post<UserItemBackend>("/usuarios/", data));
}

export async function update(id: number, data: UsuarioDTO) {
  return axios_call_to_result(async () => await api.put<UserItemBackend>(`/usuarios/${id}/`, data));
}

export async function delete_usuario(id: number) {
  return axios_call_to_result(async () => await api.delete<unknown>(`/usuarios/${id}/`));
}

export type CambiarPasswordDTO = {
  password_actual: string;
  password_nuevo: string;
  password_nuevo2: string;
};

export async function cambiarPassword(id: number, data: CambiarPasswordDTO) {
  return axios_call_to_result(async () => await api.post<unknown>(`/usuarios/${id}/cambiar_password/`, data));
}
