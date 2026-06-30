import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';

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

const USUARIO_SIMULADO: User = {
  id: 1,
  nombre: 'Juan Pérez',
  email: 'admin@email.com',
  rol: 'Administrador',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === 'admin@email.com' && password === 'admin123') {
      setUser(USUARIO_SIMULADO);
      setLoading(false);
      return USUARIO_SIMULADO;
    } else {
      setLoading(false);
      throw new Error('Credenciales incorrectas');
    }
  };

  const logout = () => {
    setUser(null);
  };

  const value: AuthContextType = {
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