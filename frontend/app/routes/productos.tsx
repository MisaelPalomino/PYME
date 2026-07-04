import { useState } from 'react';
import { productosAPI, categoriasAPI, proveedoresAPI } from '~/api/api';
import type { Producto } from '~/api/types';
import { Button } from '~/components/ui/button';
import type { Route } from "./+types/productos";
import { ArrowDown, ArrowUp, ArrowUpDown, Edit2, Plus, Trash2 } from 'lucide-react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type HeaderContext,
  type SortingState
} from "@tanstack/react-table";
import { TableList, type Filter } from '~/components/Table';

type ProductoFormData = {
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

function createSortableHeader<T>(name: string) {
  return ({ column }: HeaderContext<Producto, T>) => {
    const sorted = column.getIsSorted();

    return (
      <button
        onClick={column.getToggleSortingHandler()}
        className={`items-center px-4 py-2 ${column.getIsSorted() ? "text-foreground" : "text-muted-foreground"}`}
      >
        <div className="flex gap-1">
          {name}

          {!sorted && <ArrowUpDown className="w-4 h-4 text-muted-foreground" />}
          {sorted === "asc" && <ArrowUp className="w-4 h-4 text-foreground" />}
          {sorted === "desc" && <ArrowDown className="w-4 h-4 text-foreground" />}
        </div>
      </button>
    );
  };
}

const columnHelper = createColumnHelper<Producto>();

const columns = [
  columnHelper.accessor("nombre", {
    header: createSortableHeader("Producto / SKU"),
    enableSorting: true,
    enableColumnFilter: true,

    filterFn: (row, _, value) => {
      const texto = value.toLowerCase();

      const nombre = row.original.nombre.toLowerCase();
      const sku = row.original.sku.toLowerCase();

      return (
        nombre.includes(texto) ||
        sku.includes(texto)
      );
    },

    size: NaN,
    cell: (info) => (
      <div className="px-4 py-3">
        <p className="text-foreground">{info.getValue()}</p>
        <p className="text-xs text-muted-foreground font-mono">{info.row.original.sku}</p>
      </div>
    )
  }),
  columnHelper.accessor("categoria_nombre", {
    header: createSortableHeader("Categoría"),
    enableSorting: true,
    enableColumnFilter: true,
    cell: (info) => (
      <div className="px-4 py-3 text-muted-foreground">{info.getValue()}</div>
    )
  }),
  columnHelper.accessor("stock_actual", {
    header: createSortableHeader("Stock"),
    cell: (info) => {
      const stock = info.getValue();
      const { stock_actual, stock_maximo, stock_minimo } = info.row.original;

      const p = Math.min(Math.max((stock_actual - stock_minimo) / (stock_maximo - stock_minimo), 0.0), 1.0);

      let color = "text-foreground";

      if (p <= 0.20) {
        color = "text-destructive"; // rojo
      } else if (p <= 0.40) {
        color = "text-yellow-600"; // amarillo
      }

      return (
        <div className="px-4 py-3 text-center">
          <span className={color}>{stock}</span>
        </div>
      );
    },
  }),
  columnHelper.display({
    id: "minmax",
    header: "Min / Max",
    cell: (info) => {
      const p = info.row.original;

      return <div className="px-4 py-3 text-center text-muted-foreground">{p.stock_minimo} / {p.stock_maximo}</div>;
    }
  }),
  columnHelper.accessor("precio", {
    header: createSortableHeader("Precio"),
    cell: (info) => <div className="px-4 py-3 text-center text-foreground">S/ {info.getValue()}</div>
  }),
  columnHelper.display({
    id: "actions",
    header: "Acciones",
    cell: () => {
      return (
        <div className="px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            <button className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      );
    }
  })
];

export async function loader() {
  const [
    { data: productos },
    { data: categorias },
    { data: proveedores }
  ] = await Promise.all([
    productosAPI.getAll(),
    categoriasAPI.getAll(),
    proveedoresAPI.getAll()
  ]);

  return {
    productos,
    categorias,
    proveedores
  };
}

export default function Productos({ loaderData }: Route.ComponentProps) {
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
  const statusConfig = {
    critical: { label: 'Crítico', variant: 'destructive' as const },
    warning: { label: 'Aviso', variant: 'secondary' as const },
    normal: { label: 'Normal', variant: 'outline' as const },
  };


  const aplicarFiltros = async () => {
    // setLoading(true);
    try {
      const params: Record<string, any> = {};
      // if (filtros.search) params.search = filtros.search;
      // if (filtros.categoria) params.categoria = filtros.categoria;
      const response = await productosAPI.getAll(params);
      // setProductos(response.data);
    } catch (error) {
      // setError('Error al aplicar filtros');
    } finally {
      // setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setLoading(true);
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
      // cargarDatos();
    } catch (error) {
      // setError('Error al guardar el producto');
      console.error(error);
    } finally {
      // setLoading(false);
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
      // cargarDatos();
    } catch (error) {
      // setError('Error al eliminar el producto');
    }
  };

  const filters: Filter[] = [
    {
      type: "input",
      columnName: "nombre",
      placeholder: "Buscar por nombre o SKU..."
    },
    {
      type: "combobox",
      columnName: "categoria_nombre",
      placeholder: "Categoría",
      items: loaderData.categorias.map(x => x.nombre)
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">Productos</h1>
          <p className="text-sm text-muted-foreground">{loaderData.productos.length} productos registrados</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>
      <h2 className="text-2xl font-bold mb-6">📦 Gestión de Productos</h2>
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
                  {loaderData.categorias.map((cat) => (
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
                  {loaderData.proveedores.map((prov) => (
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

      {/* Table */}
      <TableList data={loaderData.productos} columns={columns} filters={filters}/>
    </div>
  );
}
