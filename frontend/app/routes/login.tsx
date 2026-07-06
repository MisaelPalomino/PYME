import { Form, useFetcher } from 'react-router';
import { Button } from '~/components/ui/button';
import type { Route } from "./+types/login";
import { useEffect, useState } from 'react';
import type { LoginAPIData } from '~/api/types';
import { LoginAPI, type Result } from '~/api/api';
import { toast } from 'sonner';

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  const data: LoginAPIData = {
    username: formData.get("username") as string,
    password: formData.get("password") as string,
  };

  const result = await LoginAPI.login(data);
  console.warn(result);
  return result;
}

export default function Login() {
  const fetcher = useFetcher<typeof action>();
  const [formData, setFormData] = useState<LoginAPIData>({
    username: "",
    password: "",
  });

  useEffect(() => {
    if (!fetcher.data) return;
    if (fetcher.data.ok) {
      toast.success(fetcher.data.data.access);
    } else {
      toast.error(fetcher.data.error);
    }
  }, [fetcher.data]);

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

        <fetcher.Form method="post">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              placeholder="admin@email.com"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="admin123"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={fetcher.state !== "idle"}
          >
            {fetcher.state !== "idle" ? 'Cargando...' : 'Iniciar Sesión'}
          </Button>
        </fetcher.Form>

        <Button
          type="button"
          variant="outline"
          className="w-full mt-3"
        >
          Crear cuenta
        </Button>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Demo: admin@email.com / admin123</p>
        </div>
      </div>
    </div>
  );
  /*
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Si ya está autenticado, ir al dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Entró al submit");
    console.log(email, pacreo que est´ssword);

    setLoading(true);
    setError("");

    try {
        console.log("Antes del login");

        const result = await login(email, password);

        console.log("Después del login");
        console.log(result);

    } catch (err) {
        console.error(err);
        setError("Credenciales incorrectas");
    } finally {
        setLoading(false);
    }
};

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

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@email.com"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </Button>
        </form>

         <Button
            type="button"
            variant="outline"
            className="w-full mt-3"
            onClick={() => navigate("/registro")}
          >
            Crear cuenta
          </Button>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Demo: admin@email.com / admin123</p>
        </div>
      </div>
    </div>
  );
  */
}
