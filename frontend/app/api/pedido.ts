import axios from "axios";
import { axios_call_to_result } from "~/lib/result";
import * as z from "zod";

const api = axios.create({
  baseURL: "http://localhost:8000/api/pedidos",
  headers: {
    'Content-Type': 'application/json',
  },
});

export const PedidoRequestSchema = z.object({
  id_proveedor: z.number().positive("El proveedor es requerido"),
  fecha_esperada: z.string().optional(),
  observaciones: z.string().optional(),
  detalles: z.array(z.object({
    id_producto: z.number().positive("El producto es requerido"),
    cantidad: z.number().positive("La cantidad debe ser mayor a 0"),
  })),
});

export type PedidoRequest = z.infer<typeof PedidoRequestSchema>;

export type PedidoResponse = {
  id_pedido: number;
  id_proveedor: number;
  proveedor_nombre: string;
  id_usuario: number;
  usuario_nombre: string;
  fecha_pedido: string;
  fecha_esperada: string;
  fecha_recepcion: string | null;
  estado: "pendiente" | "enviado" | "recibido" | "cancelado";
  total: number;
  detalles: {
    id_producto: number;
    producto_nombre: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }[];
};

export type PedidoListResponse = PedidoResponse[];

export async function getPedidos() {
  return axios_call_to_result(async () => await api.get<PedidoListResponse>("/pedidos/"));
}

export async function getPedido(id: number) {
  return axios_call_to_result(async () => await api.get<PedidoResponse>(`/pedidos/${id}/`));
}

export async function createPedido(data: PedidoRequest) {
  return axios_call_to_result(async () => await api.post<PedidoResponse>("/pedidos/", data));
}

export async function updatePedidoEstado(id: number, estado: string) {
  return axios_call_to_result(async () => await api.patch<PedidoResponse>(`/pedidos/${id}/estado/`, { estado }));
}

export async function recibirPedido(id: number) {
  return axios_call_to_result(async () => await api.post<PedidoResponse>(`/pedidos/${id}/recibir/`));
}

export async function deletePedido(id: number) {
  return axios_call_to_result(async () => await api.delete(`/pedidos/${id}/`));
}