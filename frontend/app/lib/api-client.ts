import axios from "axios";

const base_url = (typeof import.meta.env !== 'undefined' && import.meta.env.VITE_API_URL) || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: base_url,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const sessionStr = localStorage.getItem("session");
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session?.access) {
          config.headers.Authorization = `Bearer ${session.access}`;
        }
      } catch (e) {
        console.error('Error parsing session from localStorage in request interceptor', e);
      }
    }
  }
  return config;
});
