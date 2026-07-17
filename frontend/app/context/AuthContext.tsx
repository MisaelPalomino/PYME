import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import * as api from "~/api/login";

const COOKIE_KEY = "session";

type AuthContextType = {
  login: (session: api.LoginResponse) => void,
  logout: () => void,
  session: api.LoginResponse | null,
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<api.LoginResponse | null>(() => {
    if (typeof window !== 'undefined') {
      const sessionStr = localStorage.getItem(COOKIE_KEY);
      if (sessionStr) {
        try {
          return JSON.parse(sessionStr) as api.LoginResponse;
        } catch (e) {
          console.error('Error parsing session from localStorage', e);
          return null;
        }
      }
    }
    return null;
  });

  const login = (session: api.LoginResponse) => {
    setSession(session);
    localStorage.setItem(COOKIE_KEY, JSON.stringify(session));
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem(COOKIE_KEY);
  };

  const value: AuthContextType = {
    session,
    login,
    logout,
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
