import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// ✅ Función para obtener el token en cada petición
const getToken = () => {
  if (typeof window !== 'undefined') {
    try {
      const sessionData = localStorage.getItem('session');
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        return parsed.access || null;
      }
    } catch (e) {
      console.error('Error al obtener token:', e);
    }
  }
  return null;
};

// Crear una instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Interceptor que se ejecuta ANTES de cada petición
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const movimientosAPI = {
  getAll: async (params?: Record<string, any>) => {
    const response = await api.get("/movimientos/", { params });
    return response;
  },
  getHistorialPorProducto: async (id_producto: number) => {
    const response = await api.get(`/movimientos/producto/${id_producto}/`);
    return response;
  },
  create: async (data: any) => {
    const backendData = {
      tipo_movimiento: data.tipo_movimiento.toLowerCase(),
      cantidad: Number(data.cantidad),
      observaciones: data.observaciones || '',
      id_producto: Number(data.id_producto),
      id_usuario: Number(data.id_usuario),
    };
    const response = await api.post('/movimientos/', backendData);
    return response;
  }
};

export const productosAPI = {
  getAll: async () => {
    const response = await api.get("/core/productos/");
    return response;
  }
};