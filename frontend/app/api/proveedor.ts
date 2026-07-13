export type Proveedor = {
  id_proveedor: number,
  nombre: string,
  contacto: string,
  correo: string,
  telefono: string,
  lead_time_dias: number,
  activo: boolean,
  porcentaje_cumplimiento: number,
  categorias: {
    nombre: string,
    id_categoria: number
  }[]
}

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
