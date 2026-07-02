import { useState, useEffect } from 'react';
import { categoriasAPI, type Categoria } from '~/api/api';
import { Button } from '~/components/ui/button';
import { useAuth } from '~/context/AuthContext';
import type { Route } from "./+types/categorias";
import { Card, CardContent } from '~/components/ui/card';
import { Edit2, Tag } from 'lucide-react';
import { createColumnHelper, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable, type ColumnFiltersState } from '@tanstack/react-table';
import { FilterCard } from '~/components/FilterCard';
import Pagination from '~/components/Pagination';


export async function loader() {
  const response = await categoriasAPI.getAll();
  return {
    categorias: response.data
  };
}

const columnHelper = createColumnHelper<Categoria>();

const columns = [
  columnHelper.accessor("nombre", {
    enableColumnFilter: true,
  })
];

export default function Categorias({ loaderData }: Route.ComponentProps) {
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });

  const isAdmin = user?.rol?.toLowerCase() === 'administrador';

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data: loaderData.categorias,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    onColumnFiltersChange: setColumnFilters,
    state: {
      columnFilters
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setError('No tienes permisos para realizar esta acción');
      return;
    }
    // setLoading(true);
    try {
      const data = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
      };

      if (editId) {
        // await categoriasAPI.update(editId, data);
      } else {
        // await categoriasAPI.create(data);
      }

      resetForm();
      // cargarCategorias();
    } catch (error) {
      setError('Error al guardar la categoría');
      console.error(error);
    } finally {
      // setLoading(false);
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
      // cargarCategorias();
    } catch (error) {
      setError('Error al eliminar la categoría');
    }
  };

  function handleFilter(values: Record<string, string>) {
    table.getColumn("nombre")?.setFilterValue(values["search"]);
  }

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

      <FilterCard onChange={handleFilter}>
        <FilterCard.Input name="search" placeholder="Buscar por nombre" />
      </FilterCard>

      {table.getRowCount() == 0 &&
        <div className="py-8 text-center text-muted-foreground">
          No se encontraron proveedores.
        </div>
      }

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {table.getRowModel().rows.map(row => {
          const cat = row.original;

          return (
            <Card key={cat.id_categoria} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-accent rounded-lg">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => console.log("Implement this!")} className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h3 className="text-foreground mb-1">{cat.nombre}</h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{cat.descripcion}</p>
              </CardContent>
            </Card>
          );
        }
        )}
      </div>

      <Pagination table={table} />
    </div>
  );
}
