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

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 Unauthorized and not a login request, try to refresh token or redirect
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/api/auth/login")) {
      originalRequest._retry = true;

      if (typeof window !== 'undefined') {
        const sessionStr = localStorage.getItem("session");
        if (sessionStr) {
          try {
            const session = JSON.parse(sessionStr);
            const refresh = session?.refresh;

            if (refresh) {
              // Try to refresh token
              const refreshResponse = await axios.post(`${base_url}/api/auth/token/refresh/`, {
                refresh: refresh,
              });

              if (refreshResponse.status === 200 && refreshResponse.data.access) {
                // Update session access token
                session.access = refreshResponse.data.access;
                localStorage.setItem("session", JSON.stringify(session));

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${session.access}`;
                return apiClient(originalRequest);
              }
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
          }
        }

        // If refresh fails or there's no session, clear storage and redirect to login page
        localStorage.removeItem("session");
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

