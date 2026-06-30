import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productosAPI = {
  getAll: (params: Record<string, any> = {}) => api.get('/core/productos/', { params }),
  getOne: (id: number) => api.get(`/core/productos/${id}/`),
  create: (data: any) => api.post('/core/productos/', data),
  update: (id: number, data: any) => api.put(`/core/productos/${id}/`, data),
  delete: (id: number) => api.delete(`/core/productos/${id}/`),
};

export type Categoria = {
  id_categoria: number;
  nombre: string;
  descripcion: string;
}

// FIXME: Maybe the types are wrong
export const categoriasAPI = {
  getAll: () => api.get<Categoria[]>('/core/categorias/'),
  getOne: (id: number) => api.get<Categoria>(`/core/categorias/${id}/`),
  create: (data: Categoria) => api.post('/core/categorias/', data),
  update: (id: number, data: Categoria) => api.put(`/core/categorias/${id}/`, data),
  delete: (id: number) => api.delete(`/core/categorias/${id}/`),
};

export const proveedoresAPI = {
  getAll: () => api.get('/core/proveedores/'),
  getOne: (id: number) => api.get(`/core/proveedores/${id}/`),
  create: (data: any) => api.post('/core/proveedores/', data),
  update: (id: number, data: any) => api.put(`/core/proveedores/${id}/`, data),
  delete: (id: number) => api.delete(`/core/proveedores/${id}/`),
};

export default api;
