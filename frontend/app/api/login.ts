import { apiClient } from "~/lib/api-client";
import { axios_call_to_result } from "~/lib/result";
import * as z from "zod";

export const LoginRequestSchema = z.object({
  username: z.string().nonempty("El nombre de usuario es requerido."),
  password: z.string().nonempty("La contraseña es requerida."),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export type LoginResponse = {
  access: string,
  refresh: string,
  usuario: {
    id_usuario: number,
    username: string,
    nombre: string,
    email: string,
    rol: string,
  }
};

export async function login(data: LoginRequest) {
  return axios_call_to_result(async () => await apiClient.post<LoginResponse>("/api/auth/login/", data));
}

export type LogoutRequest = {
  access: string,
  refresh: string,
}

export type LogoutResponse = {
  detail: string
};

export async function logout(data: LogoutRequest) {
  return axios_call_to_result(async () => await apiClient.post<LogoutResponse>("/api/auth/logout/", { refresh: data.refresh }, {
    headers: {
      Authorization: `Bearer ${data.access}`
    }
  }));
}
