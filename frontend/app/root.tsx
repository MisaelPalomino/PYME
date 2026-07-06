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
import { AuthProvider } from "~/context/AuthContext";
import { Toaster } from "~/components/ui/sonner";
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
        <Toaster />
      </body>
    </html>
  )
}


export default function App() {
  return (
      <Outlet />
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let title = "Ha ocurrido un error";
  let description =
    "Ocurrió un problema inesperado. Intenta nuevamente dentro de unos momentos.";
  let status: number | undefined;
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    status = error.status;

    switch (error.status) {
      case 400:
        title = "Solicitud inválida";
        description = "La información enviada no es válida.";
        break;

      case 401:
        title = "No autorizado";
        description = "Debes iniciar sesión para acceder a esta página.";
        break;

      case 403:
        title = "Acceso denegado";
        description =
          "No tienes permisos suficientes para realizar esta acción.";
        break;

      case 404:
        title = "Página no encontrada";
        description =
          "La página solicitada no existe o fue eliminada.";
        break;

      case 500:
        title = "Error interno del servidor";
        description =
          "Se produjo un problema en el servidor. Intenta nuevamente más tarde.";
        break;

      default:
        title = `Error ${error.status}`;
        description = error.data?.message ??
          "No fue posible completar la solicitud.";
    }
  } else if (error instanceof Error) {
    title = "Error inesperado";

    if (import.meta.env.DEV) {
      description = error.message;
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
