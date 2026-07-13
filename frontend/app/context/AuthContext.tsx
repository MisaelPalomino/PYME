import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import * as api from "~/api/login";

const COOKIE_KEY = "session";

type AuthContextType = {
  login: (session: api.LoginResponse) => void,
  logout: () => void,
  session: api.LoginResponse | null,
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/*
TODO
[nonuya] 12/07/2026
Acá hay un """""error""""" que debería (o no) verse.
La cuestión es que estoy guardando todo en el localStorage. Cosa que creo no debería hacerse.
Siento que se tiene que separar los tokens con la información del Usuario, tal vez con diferentes llamadas al API o yo que sé.
La cuestión es que como no sé hacer esto lo dejo acá.
¿Qué de malo tiene? Dibuja la pantalla de login y luego redirecciona hacia donde debería ser.
Personalmente no me gusta.
Si alguien encuentra otra solución sería genial!
Tal vez Cookies¿???¡???¡¡?
*/
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<api.LoginResponse | null>(null);

  useEffect(() => {
    const session = localStorage.getItem(COOKIE_KEY);
    if (session) {
      setSession(JSON.parse(session) as api.LoginResponse);
    }
  }, []);

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
