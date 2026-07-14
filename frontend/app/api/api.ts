import axios, { AxiosError, type AxiosResponse } from 'axios';
import type { Prediccion } from '~/api/types';




export const iaAPI = {
  getAll: async () => {
    const res = await api.get<Prediccion[]>('/ia/predicciones/');
    return { data: res.data };
  },
  generarTodos: async () => {
    return await api.post('/ia/predicciones/generar-todos/');
  }
};




