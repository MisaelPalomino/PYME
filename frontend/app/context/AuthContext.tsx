import { createContext, useState, useContext, useEffect } from 'react';
import api from '~/api/api';

interface User {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await api.get('/auth/me/');
          setUser(response.data);
        } catch (error) {
          console.error('Error al cargar usuario:', error);
          localStorage.removeItem('access_token');
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    console.log('🔐 Intentando login...');
    setLoading(true);
    try {
      const response = await api.post('/auth/login/', {
        username: email,
        password
      });
      
      console.log('✅ Respuesta del backend:', response.data);
      
      const { access, usuario } = response.data;
      localStorage.setItem('access_token', access);
      setUser(usuario);
      setLoading(false);
      return usuario;
      }catch (error: any) {
        console.log(error.response?.data.non_field_errors);
        throw error;
      }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};