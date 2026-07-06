import axios from 'axios';
import type { Proveedor, Categoria, Producto, Movimiento, Dashboard, Pedido } from '~/api/types';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const dashboardAPI = {
  getAll: async () => await api.get<Dashboard>("/dashboard/dashboard")
}

export const productosAPI = {
  getAll: async (params: Record<string, any> = {}) => {
    return await api.get<Producto[]>('/core/productos/', { params });
  },
  getOne: async (id: number) => {
    return await api.get<Producto>(`/core/productos/${id}/`);
  },
  create: async (data: any) => {
    return await api.post<Producto>('/core/productos/', data);
  },
  update: async (id: number, data: any) => {
    return await api.put<Producto>(`/core/productos/${id}/`, data);
  },
  delete: async (id: number) => {
    return await api.delete(`/core/productos/${id}/`);
  },
};

export const categoriasAPI = {
  getAll: async () => {
    return await api.get<Categoria[]>('/core/categorias/');
  },
  getOne: async (id: number) => {
    return await api.get<Categoria>(`/core/categorias/${id}/`);
  },
  create: async (data: Omit<Categoria, 'id_categoria'>) => {
    return await api.post<Categoria>('/core/categorias/', data);
  },
  update: async (id: number, data: Omit<Categoria, 'id_categoria'>) => {
    return await api.put<Categoria>(`/core/categorias/${id}/`, data);
  },
  delete: async (id: number) => {
    return await api.delete(`/core/categorias/${id}/`);
  },
};

export const proveedoresAPI = {
  getAll: async () => {
    return await api.get<Proveedor[]>('/proveedores/proveedores/');
  },
  getOne: async (id: number) => {
    return await api.get<any>(`/proveedores/proveedores/${id}/`);
  },
  create: async (data: any) => {
    return await api.post('/proveedores/proveedores/', data);
  },
  update: async (id: number, data: any) => {
    return await api.put(`/proveedores/proveedores/${id}/`, data);
  },
  delete: async (id: number) => {
    return await api.delete(`/proveedores/proveedores/${id}/`);
  },
};

export const movimientosAPI = {
  getAll: async (params: Record<string, any> = {}) => {
    const res = await api.get<any[]>('/movimientos/', { params });
    const mapped = res.data.map(m => ({
      id: m.id_movimiento,
      producto_nombre: m.producto_nombre || '',
      tipo_movimiento: (m.tipo_movimiento === 'entrada' || m.tipo_movimiento === 'Entrada') ? 'Entrada' as const : 'Salida' as const,
      fecha: new Date(m.fecha),
      cantidad: m.cantidad,
      observaciones: m.observaciones || '',
      id_producto: m.id_producto,
    }));
    return { data: mapped };
  },
  create: async (data: any) => {
    const backendData = {
      tipo_movimiento: data.tipo_movimiento.toLowerCase(),
      cantidad: Number(data.cantidad),
      observaciones: data.observaciones || '',
      id_producto: Number(data.id_producto),
      id_usuario: Number(data.id_usuario),
    };
    return await api.post('/movimientos/', backendData);
  }
};

export const iaAPI = {
  getAll: async () => {
    const res = await api.get<any[]>('/ia/predicciones/');
    return { data: res.data };
  },
  generarTodos: async () => {
    return await api.post('/ia/predicciones/generar-todos/');
  }
};

export const pedidosAPI = {
  getAll: async () => {
    return await api.get<Pedido[]>('/pedidos/pedidos/');
  },
  getOne: async (id: number) => {
    return await api.get<Pedido>(`/pedidos/pedidos/${id}/`);
  },
  create: async (data: any) => {
    return await api.post<Pedido>('/pedidos/pedidos/', data);
  },
  updateEstado: async (id: number, estado: string) => {
    return await api.patch<Pedido>(`/pedidos/pedidos/${id}/estado/`, { estado });
  },
  recibir: async (id: number) => {
    return await api.post<Pedido>(`/pedidos/pedidos/${id}/recibir/`);
  },
  delete: async (id: number) => {
    return await api.delete(`/pedidos/pedidos/${id}/`);
  }
};

export const informesAPI = {
  getBajoStock: async (params: Record<string, any> = {}) => {
    return await api.get<any[]>('/informes/bajo-stock/', { params });
  },
  getRotacion: async (params: Record<string, any> = {}) => {
    return await api.get<any[]>('/informes/rotacion/', { params });
  },
  getConsolidado: async () => {
    return await api.get<any>('/informes/consolidado/');
  },
  getGraficosComprasVentas: async (params: Record<string, any> = {}) => {
    return await api.get<any[]>('/informes/graficos-compras-ventas/', { params });
  }
};

