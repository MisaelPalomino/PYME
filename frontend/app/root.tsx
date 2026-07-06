import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router"
import type { Route } from "./+types/root"
import "./app.css"
import { useState } from "react";
import { Sidebar } from "~/components/layout/Sidebar";
import { Header } from "~/components/layout/Header";
import { AuthProvider, useAuth } from "~/context/AuthContext";
import {
  AlertCircle,
  Bug,
  Home,
  RefreshCw,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "~/components/ui/alert";
import { Toaster } from "./components/ui/sonner";

export function Layout({ children }: { children: any }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading } = useAuth();

  // Mostrar loading si está cargando
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  // Si no hay usuario, mostrar SOLO el login (sin sidebar)
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    );
  }

  // Si hay usuario, mostrar el layout completo
  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
        <Header
          onMenuClick={() => setMobileOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
          currentUser={user ? { name: user.nombre, role: user.rol } : { name: "Invitado", role: "Sin rol" }}
        />

        <main className="pt-16 min-h-screen">
          <div className="px-4 py-6 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
        <Toaster />
      </div>
    </div>
  );
}

export default function App() {
  return <AppLayout />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  // ... mantener el error boundary igual
}