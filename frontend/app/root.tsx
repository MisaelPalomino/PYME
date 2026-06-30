import {
  Link,
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

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

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
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let title = "Ha ocurrido un error";
  let description = "Se produjo un error inesperado.";
  let status: number | undefined;
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    status = error.status;

    if (status === 404) {
      title = "Página no encontrada";
      description =
        "La página que intentas visitar no existe o fue movida.";
    } else {
      title = error.statusText || "Error";
      description = "No fue posible completar la solicitud.";
    }
  } else if (error instanceof Error) {
    description = error.message;

    if (import.meta.env.DEV) {
      stack = error.stack;
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-6xl shadow-lg">
        <CardHeader className="items-center text-center">
          <AlertCircle className="mb-2 h-12 w-12 text-destructive" />

          {status && (
            <Badge variant="destructive">
              Error {status}
            </Badge>
          )}

          <CardTitle className="mt-3 text-3xl">
            {title}
          </CardTitle>

          <CardDescription>
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {stack && (
            <Alert variant="destructive">
              <Bug className="h-4 w-4" />

              <AlertTitle>Error de desarrollo</AlertTitle>

              <AlertDescription className="min-w-0">
                <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-4 text-xs">
                  <code>{stack}</code>
                </pre>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Inicio
              </Link>
            </Button>

            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
