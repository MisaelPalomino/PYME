import { useState, useEffect } from 'react';
import { categoriasAPI } from '~/api/api';
import { Button } from '~/components/ui/button';
import { useAuth } from '~/context/AuthContext';

interface Categoria {
  id_categoria: number;
  nombre: string;
  descripcion: string;
}

export default function Categorias() {
  const { user } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });

  const isAdmin = user?.rol?.toLowerCase() === 'administrador';

  const cargarCategorias = async () => {
    setLoading(true);
    try {
      const response = await categoriasAPI.getAll();
      setCategorias(response.data);
      setError('');
    } catch (error) {
      setError('Error al cargar categorías');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setError('No tienes permisos para realizar esta acción');
      return;
    }
    setLoading(true);
    try {
      const data = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
      };

      if (editId) {
        await categoriasAPI.update(editId, data);
      } else {
        await categoriasAPI.create(data);
      }
      
      resetForm();
      cargarCategorias();
    } catch (error) {
      setError('Error al guardar la categoría');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', descripcion: '' });
    setEditId(null);
  };

  const handleEdit = (categoria: Categoria) => {
    if (!isAdmin) {
      setError('No tienes permisos para editar categorías');
      return;
    }
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
    });
    setEditId(categoria.id_categoria);
  };

  const handleDelete = async (id: number) => {
    if (!isAdmin) {
      setError('No tienes permisos para eliminar categorías');
      return;
    }
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;
    try {
      await categoriasAPI.delete(id);
      cargarCategorias();
    } catch (error) {
      setError('Error al eliminar la categoría');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">📂 Gestión de Categorías</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isAdmin && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">
              {editId ? 'Editar Categoría' : 'Nueva Categoría'}
            </h3>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editId ? 'Actualizar' : 'Guardar'}
                </Button>
                {editId && (
                  <Button variant="outline" type="button" onClick={resetForm}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
          📖 <strong>Modo lectura:</strong> Solo puedes ver las categorías. Los cambios solo están disponibles para el administrador.
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Descripción</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {categorias.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                      No hay categorías
                    </td>
                  </tr>
                ) : (
                  categorias.map((cat) => (
                    <tr key={cat.id_categoria} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{cat.id_categoria}</td>
                      <td className="px-4 py-3 text-sm font-medium">{cat.nombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {cat.descripcion || <span className="text-gray-400">Sin descripción</span>}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {isAdmin ? (
                          <>
                            <button
                              className="px-2 py-1 text-blue-600 hover:text-blue-800 mr-2"
                              onClick={() => handleEdit(cat)}
                            >
                              ✏️
                            </button>
                            <button
                              className="px-2 py-1 text-red-600 hover:text-red-800"
                              onClick={() => handleDelete(cat.id_categoria)}
                            >
                              🗑️
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-400 text-xs">🔒 Solo admin</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}