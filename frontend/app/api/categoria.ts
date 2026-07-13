export type Categoria = {
  id_categoria: number;
  nombre: string;
  descripcion: string;
}
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
