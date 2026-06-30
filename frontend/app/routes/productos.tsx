import { useState, useEffect } from 'react';
import { productosAPI, categoriasAPI, proveedoresAPI } from '~/api/api';
import { Button } from '~/components/ui/button';
import { useAuth } from '~/context/AuthContext';

interface Categoria {
  id_categoria: number;
  nombre: string;
  descripcion: string;
}

interface Proveedor {
  id_proveedor: number;
  nombre: string;
}

interface Producto {
  id_producto: number;
  nombre: string;
  sku: string;
  descripcion: string;
  precio: number;
  stock_actual: number;
  stock_minimo: number;
  stock_maximo: number;
  id_categoria: number;
  categoria_nombre?: string;
  id_proveedor_principal: number;
  proveedor_nombre?: string;
}

interface ProductoFormData {
  nombre: string;
  sku: string;
  descripcion: string;
  precio: string;
  stock_actual: string;
  stock_minimo: string;
  stock_maximo: string;
  id_categoria: string;
  id_proveedor_principal: string;
}

export default function Productos() {
  const { user } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({ search: '', categoria: '' });
  const [formData, setFormData] = useState<ProductoFormData>({
    nombre: '',
    sku: '',
    descripcion: '',
    precio: '',
    stock_actual: '',
    stock_minimo: '',
    stock_maximo: '',
    id_categoria: '',
    id_proveedor_principal: '',
  });
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [productosRes, categoriasRes, proveedoresRes] = await Promise.all([
        productosAPI.getAll(),
        categoriasAPI.getAll(),
        proveedoresAPI.getAll(),
      ]);
      setProductos(productosRes.data);
      setCategorias(categoriasRes.data);
      setProveedores(proveedoresRes.data);
      setError('');
    } catch (error) {
      setError('Error al cargar los datos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (filtros.search) params.search = filtros.search;
      if (filtros.categoria) params.categoria = filtros.categoria;
      const response = await productosAPI.getAll(params);
      setProductos(response.data);
    } catch (error) {
      setError('Error al aplicar filtros');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        precio: parseFloat(formData.precio),
        stock_actual: parseInt(formData.stock_actual) || 0,
        stock_minimo: parseInt(formData.stock_minimo) || 0,
        stock_maximo: parseInt(formData.stock_maximo) || 0,
        id_categoria: parseInt(formData.id_categoria),
        id_proveedor_principal: parseInt(formData.id_proveedor_principal),
      };

      if (editId) {
        await productosAPI.update(editId, data);
      } else {
        await productosAPI.create(data);
      }
      
      resetForm();
      cargarDatos();
    } catch (error) {
      setError('Error al guardar el producto');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      sku: '',
      descripcion: '',
      precio: '',
      stock_actual: '',
      stock_minimo: '',
      stock_maximo: '',
      id_categoria: '',
      id_proveedor_principal: '',
    });
    setEditId(null);
  };

  const handleEdit = (producto: Producto) => {
    setFormData({
      nombre: producto.nombre,
      sku: producto.sku,
      descripcion: producto.descripcion || '',
      precio: producto.precio.toString(),
      stock_actual: producto.stock_actual.toString(),
      stock_minimo: producto.stock_minimo.toString(),
      stock_maximo: producto.stock_maximo.toString(),
      id_categoria: producto.id_categoria.toString(),
      id_proveedor_principal: producto.id_proveedor_principal?.toString() || '',
    });
    setEditId(producto.id_producto);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await productosAPI.delete(id);
      cargarDatos();
    } catch (error) {
      setError('Error al eliminar el producto');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">📦 Gestión de Productos</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">
            {editId ? 'Editar Producto' : 'Nuevo Producto'}
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
                <label className="block text-sm font-medium mb-1">SKU *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Precio *</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Categoría *</label>
                <select
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.id_categoria}
                  onChange={(e) => setFormData({ ...formData, id_categoria: e.target.value })}
                  required
                >
                  <option value="">Seleccionar categoría...</option>
                  {categorias.map((cat) => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Proveedor Principal *</label>
                <select
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.id_proveedor_principal}
                  onChange={(e) => setFormData({ ...formData, id_proveedor_principal: e.target.value })}
                  required
                >
                  <option value="">Seleccionar proveedor...</option>
                  {proveedores.map((prov) => (
                    <option key={prov.id_proveedor} value={prov.id_proveedor}>
                      {prov.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Stock Actual</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.stock_actual}
                  onChange={(e) => setFormData({ ...formData, stock_actual: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock Mínimo</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.stock_minimo}
                  onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock Máximo</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.stock_maximo}
                  onChange={(e) => setFormData({ ...formData, stock_maximo: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              />
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

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-[200px]"
          placeholder="Buscar por nombre o SKU..."
          value={filtros.search}
          onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
        />
        <select
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filtros.categoria}
          onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat.id_categoria} value={cat.id_categoria}>
              {cat.nombre}
            </option>
          ))}
        </select>
        <Button onClick={aplicarFiltros}>
          Filtrar
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setFiltros({ search: '', categoria: '' });
            cargarDatos();
          }}
        >
          Limpiar
        </Button>
      </div>

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
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">SKU</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Categoría</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Precio</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {productos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-4 text-center text-gray-500">
                      No hay productos
                    </td>
                  </tr>
                ) : (
                  productos.map((p) => (
                    <tr key={p.id_producto} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{p.id_producto}</td>
                      <td className="px-4 py-3 text-sm font-medium">{p.nombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.sku}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs">
                          {p.categoria_nombre || 'Sin categoría'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          p.stock_actual <= p.stock_minimo ? 'bg-red-100 text-red-700' :
                          p.stock_actual >= p.stock_maximo ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {p.stock_actual}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">${Number(p.precio).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          className="px-2 py-1 text-blue-600 hover:text-blue-800 mr-2"
                          onClick={() => handleEdit(p)}
                        >
                          ✏️
                        </button>
                        <button
                          className="px-2 py-1 text-red-600 hover:text-red-800"
                          onClick={() => handleDelete(p.id_producto)}
                        >
                          🗑️
                        </button>
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