import axios, { AxiosError, type AxiosResponse } from 'axios';
import type { Movimiento, Dashboard, Pedido, Prediccion, LoginAPIData } from '~/api/types';




export const iaAPI = {
  getAll: async () => {
    const res = await api.get<Prediccion[]>('/ia/predicciones/');
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


export const usuariosAPI = {
  getAll: async () => {
    return await api.get<any[]>('/auth/usuarios/');
  },
  getOne: async (id: number) => {
    return await api.get<any>(`/auth/usuarios/${id}/`);
  },
  create: async (data: any) => {
    return await api.post('/auth/usuarios/', data);
  },
  update: async (id: number, data: any) => {
    return await api.put(`/auth/usuarios/${id}/`, data);
  },
  delete: async (id: number) => {
    return await api.delete(`/auth/usuarios/${id}/`);
  },
  cambiarPassword: async (id: number, data: any) => {
    return await api.post(`/auth/usuarios/${id}/cambiar_password/`, data);
  }
};
