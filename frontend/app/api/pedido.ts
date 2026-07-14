import axios from "axios";
import { axios_call_to_result } from "~/lib/result";
import { z } from "zod";
import type { Pedido as BackendPedido } from "./types";

const api = axios.create({
  baseURL: "http://localhost:8000/api/pedidos",
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

export const PedidoSchema = z.object({
  id_proveedor: z.coerce.number().min(1, "El proveedor es requerido"),
  id_producto: z.coerce.number().min(1, "El producto es requerido"),
  cantidad: z.coerce.number().min(1, "La cantidad debe ser al menos 1"),
  precio_unitario: z.coerce.number().min(0.01, "El precio unitario debe ser mayor a 0"),
});

export type PedidoFormData = z.infer<typeof PedidoSchema>;

export type PedidoFrontend = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  supplierId: string;
  supplierName: string;
  quantity: number;
  status: 'pendiente' | 'enviado' | 'recibido' | 'cancelado';
  createdAt: Date;
  expectedDate: Date;
  userId: string;
  userName: string;
  unitPrice: number;
  receivedDate?: Date;
};

export type PedidoDTO = {
  id_proveedor: number;
  id_usuario: number;
  detalles: {
    id_producto: number;
    cantidad: number;
    precio_unitario: number;
  }[];
};

export function mapBackendPedidoToFrontend(o: BackendPedido): PedidoFrontend {
  const firstDetail = o.detalles && o.detalles.length > 0 ? o.detalles[0] : null;
  const productName = firstDetail ? firstDetail.producto_nombre || 'Producto' : 'Sin productos';
  const sku = firstDetail ? firstDetail.id_producto.toString() : '';
  const expectedDate = o.fecha_esperada ? new Date(o.fecha_esperada) : (o.fecha_envio ? new Date(o.fecha_envio) : new Date(o.fecha_creacion));

  return {
    id: o.id_pedido.toString(),
    productId: firstDetail ? firstDetail.id_producto.toString() : '',
    productName: productName,
    sku: sku,
    supplierId: o.id_proveedor.toString(),
    supplierName: o.proveedor_nombre || 'Proveedor',
    quantity: firstDetail ? firstDetail.cantidad : 0,
    status: o.estado,
    createdAt: new Date(o.fecha_creacion),
    expectedDate: expectedDate,
    userId: o.id_usuario.toString(),
    userName: o.usuario_nombre || 'Usuario',
    unitPrice: firstDetail ? Number(firstDetail.precio_unitario) : 0,
    receivedDate: o.fecha_recepcion ? new Date(o.fecha_recepcion) : undefined,
  };
}

export async function get_all() {
  const result = await axios_call_to_result(async () => await api.get<BackendPedido[]>("/pedidos/"));
  if (result.ok) {
    return { ok: true as const, data: result.data.map(mapBackendPedidoToFrontend) };
  }
  return result;
}

export async function get_one(id: number) {
  const result = await axios_call_to_result(async () => await api.get<BackendPedido>(`/pedidos/${id}/`));
  if (result.ok) {
    return { ok: true as const, data: mapBackendPedidoToFrontend(result.data) };
  }
  return result;
}

export async function create(data: PedidoDTO) {
  return axios_call_to_result(async () => await api.post<BackendPedido>("/pedidos/", data));
}

export async function updateEstado(id: number, estado: string) {
  return axios_call_to_result(async () => await api.patch<BackendPedido>(`/pedidos/${id}/estado/`, { estado }));
}

export async function recibir(id: number) {
  return axios_call_to_result(async () => await api.post<BackendPedido>(`/pedidos/${id}/recibir/`));
}

async function _delete(id: number) {
  return axios_call_to_result(async () => await api.delete<unknown>(`/pedidos/${id}/`));
}

export { _delete as delete };
