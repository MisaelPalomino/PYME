import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import * as api from "~/api/login";

const STORAGE_KEY = "session";

type AuthContextType = {
  session: api.LoginResponse | null;
  login: (session: api.LoginResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isBrowser = typeof window !== 'undefined';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<api.LoginResponse | null>(null); // ← Siempre null al inicio

  const login = (newSession: api.LoginResponse) => {
    setSession(newSession);
    if (isBrowser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        access: newSession.access,
        refresh: newSession.refresh,
        usuario: newSession.usuario
      }));
    }
  };

  const logout = () => {
    setSession(null);
    if (isBrowser) {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const value = {
    session,
    login,
    logout,
    isAuthenticated: !!session,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}