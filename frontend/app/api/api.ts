import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token
api.interceptors.request.use(
  (config) => {
    // Solo ejecutar en el navegador
    if (typeof window !== 'undefined') {
      try {
        const sessionData = localStorage.getItem('session');
        if (sessionData) {
          const parsed = JSON.parse(sessionData);
          if (parsed.access) {
            config.headers.Authorization = `Bearer ${parsed.access}`;
          }
        }
      } catch (e) {
        console.error('Error al obtener token:', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;