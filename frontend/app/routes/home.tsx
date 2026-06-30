import { useAuth } from "~/context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">📊 Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-600 text-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium">Bienvenido</h3>
          <p className="text-3xl font-bold mt-2">{user?.nombre || 'Usuario'}</p>
          <p className="text-sm opacity-80 mt-1">Rol: {user?.rol || 'Sin rol'}</p>
        </div>
        <div className="bg-green-600 text-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium">Productos</h3>
          <p className="text-3xl font-bold mt-2">-</p>
          <p className="text-sm opacity-80 mt-1">Gestión de inventario</p>
        </div>
        <div className="bg-yellow-600 text-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium">Alertas</h3>
          <p className="text-3xl font-bold mt-2">0</p>
          <p className="text-sm opacity-80 mt-1">Sin alertas pendientes</p>
        </div>
      </div>
    </div>
  );
}