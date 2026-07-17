import { Button } from '~/components/ui/button';
import { toast } from 'sonner';
import * as api from "~/api/login";
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleX } from 'lucide-react';
import { useAuth } from '~/context/AuthContext';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<api.LoginRequest>({
    resolver: zodResolver(api.LoginRequestSchema as unknown as Parameters<typeof zodResolver>[0]) as unknown as Resolver<api.LoginRequest>,
  });
  const { login } = useAuth();

  async function onSubmit(data: api.LoginRequest) {
    const result = await api.login(data);
    if (result.ok) {
      login(result.data); 
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-2xl">📦</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Inventario</h1>
          <p className="text-sm text-gray-500 mt-1">Inicia sesión para continuar</p>
        </div>

        <form method="post" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de usuario
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("username")}
              placeholder="jdoe"
            />
            {errors.username && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                <CircleX className="h-3 w-3 shrink-0" />
                <span>{errors.username.message}</span>
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("password")}
              placeholder="pass1234"
            />
            {errors.password && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                <CircleX className="h-3 w-3 shrink-0" />
                <span>{errors.password.message}</span>
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
          >
            Iniciar Sesión
          </Button>
        </form>

        <Button
          type="button"
          variant="outline"
          className="w-full mt-3"
        >
          Crear cuenta
        </Button>
      </div>
    </div>
  );
}
