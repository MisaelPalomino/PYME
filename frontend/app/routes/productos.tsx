import { useState, useEffect, useMemo } from 'react';
import type { ActionFunctionArgs } from "react-router";
import { useFetcher } from "react-router";
import { Button } from '~/components/ui/button';
import type { Route } from "./+types/productos";
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { createColumnHelper } from "@tanstack/react-table";
import { createSortableHeader, TableList, type Filter } from '~/components/Table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { toast } from 'sonner';
import * as productosAPI from '~/api/producto';
import { ProductoSchema, type Producto, type ProductoDTO } from '~/api/producto';
import * as categoriasAPI from '~/api/categoria';
import type { Categoria } from '~/api/categoria';
import * as proveedoresAPI from '~/api/proveedor';
import type { Proveedor } from '~/api/proveedor';

type ProductoFormData = {
  nombre: string;
  sku: string;
  descripcion: string;
  precio: string;
  stock_actual: string;
  stock_minimo: string;
  stock_maximo: string;
  id_categoria: string ;
  id_proveedor_principal: string;
}

const columnHelper = createColumnHelper<productosAPI.Producto>();

export async function loader() {
  const [
    productosRes,
    categoriasRes,
    proveedoresRes
  ] = await Promise.all([
    productosAPI.get_all(),
    categoriasAPI.get_all(),
    proveedoresAPI.get_all()
  ]);

  if (!productosRes.ok) throw new Error(productosRes.error);
  if (!categoriasRes.ok) throw new Error(categoriasRes.error);
  if (!proveedoresRes.ok) throw new Error(proveedoresRes.error);

  return {
    productos: productosRes.data,
    categorias: categoriasRes.data,
    proveedores: proveedoresRes.data
  };
}

export default function Productos({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

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

  const openCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEdit = (producto: Producto) => {
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
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    fetcher.submit(
      { intent: "delete", id_producto: id.toString() },
      { method: "post" }
    );
  };

  // Cierra el diálogo tras un envío exitoso
  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;
    setIsDialogOpen(false);
    resetForm();
    console.warn(fetcher.data);

    if (fetcher.data.success) {
      toast.success("¡Se guardó el producto correctamente!");
    }
    /* TODO: Parece que alguien hizo que se muestre directamente
    else {
      toast.error(fetcher.data.error);
    }*/
  }, [fetcher.state, fetcher.data]);

  const columns = useMemo(() => [
    columnHelper.accessor("nombre", {
      header: createSortableHeader("Producto / SKU"),
      enableSorting: true,
      size: NaN,
      enableColumnFilter: true,

      filterFn: (row, _, value) => {
        const texto = value.toLowerCase();
        const nombre = row.original.nombre.toLowerCase();
        const sku = row.original.sku.toLowerCase();
        return nombre.includes(texto) || sku.includes(texto);
      },

      cell: (info) => (
        <div className="px-4 py-3">
          <p className="text-foreground">{info.getValue()}</p>
          <p className="text-xs text-muted-foreground font-mono">{info.row.original.sku}</p>
        </div>
      )
    }),
    columnHelper.display({
      header: "Descripción",
      size: NaN,
      cell: (info) => (
        <div className="px-4 py-3 text-muted-foreground">{info.row.original.descripcion}</div>
      )
    }),
    columnHelper.display({
      header: "Proveedor",
      size: 0,
      cell: (info) => (
        <div className="px-4 py-3 text-muted-foreground">{info.row.original.proveedor_nombre}</div>
      )
    }),
    columnHelper.accessor("categoria_nombre", {
      header: createSortableHeader("Categoría"),
      size: 0,
      cell: (info) => (
        <div className="px-4 py-3 text-muted-foreground">{info.getValue()}</div>
      )
    }),
    columnHelper.accessor("stock_actual", {
      header: createSortableHeader("Stock"),
      size: 0,
      cell: (info) => {
        const stock = info.getValue();
        const { stock_actual, stock_maximo, stock_minimo } = info.row.original;
        const ratio = stock_maximo === stock_minimo ? 1.0 : (stock_actual - stock_minimo) / (stock_maximo - stock_minimo);
        const p = Math.min(Math.max(ratio, 0.0), 1.0);

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
      size: 100,
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
      cell: (info) => {
        const producto = info.row.original;
        return (
          <div className="px-4 py-3">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => openEdit(producto)}
                className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                title="Editar producto"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(producto.id_producto)}
                className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                title="Eliminar producto"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      }
    })
  ], [loaderData.categorias]);

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
      items: loaderData.categorias.map((x: Categoria) => x.nombre)
    }
  ];

  const errors = fetcher.data && (fetcher.data as { errors?: Record<string, string[]>; error?: string }).errors;
  const generalError = fetcher.data && (fetcher.data as { errors?: Record<string, string[]>; error?: string }).error;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Productos</h1>
          <p className="text-sm text-muted-foreground">{loaderData.productos.length} productos registrados</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {generalError && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
          {generalError}
        </div>
      )}

      {/* Table */}
      <TableList data={loaderData.productos} columns={columns} filters={filters} defaultSort={[{ id: "nombre", desc: false }]} />

      {/* Dialogo Formulario Producto */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-lg max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {editId ? 'Editar Producto' : 'Nuevo Producto'}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto overflow-x-hidden max-h-[calc(90vh-8rem)] px-2">
            <fetcher.Form method="post" className="space-y-4">
              {editId && <input type="hidden" name="editId" value={editId} />}
              <input type="hidden" name="intent" value={editId ? "update" : "create"} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                  {errors?.nombre && <p className="text-destructive text-xs">{errors.nombre[0]}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    name="sku"
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                  {errors?.sku && <p className="text-destructive text-xs">{errors.sku[0]}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="precio">Precio * (S/)</Label>
                  <Input
                    id="precio"
                    name="precio"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  />
                  {errors?.precio && <p className="text-destructive text-xs">{errors.precio[0]}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="id_categoria">Categoría *</Label>
                  <select
                    id="id_categoria"
                    name="id_categoria"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground text-sm h-10"
                    required
                    value={formData.id_categoria}
                    onChange={(e) => setFormData({ ...formData, id_categoria: e.target.value })}
                  >
                    <option value="">Seleccionar categoría...</option>
                    {loaderData.categorias.map((cat: Categoria) => (
                      <option key={cat.id_categoria} value={cat.id_categoria}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                  {errors?.id_categoria && <p className="text-destructive text-xs">{errors.id_categoria[0]}</p>}
                </div>

                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="id_proveedor_principal">Proveedor Principal *</Label>
                  <select
                    id="id_proveedor_principal"
                    name="id_proveedor_principal"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground text-sm h-10"
                    required
                    value={formData.id_proveedor_principal}
                    onChange={(e) => setFormData({ ...formData, id_proveedor_principal: e.target.value })}
                  >
                    <option value="">Seleccionar proveedor...</option>
                    {loaderData.proveedores.map((prov: Proveedor) => (
                      <option key={prov.id_proveedor} value={prov.id_proveedor}>
                        {prov.nombre}
                      </option>
                    ))}
                  </select>
                  {errors?.id_proveedor_principal && <p className="text-destructive text-xs">{errors.id_proveedor_principal[0]}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="stock_actual">Stock Actual *</Label>
                  <Input
                    id="stock_actual"
                    name="stock_actual"
                    type="number"
                    min="0"
                    required
                    value={formData.stock_actual}
                    onChange={(e) => setFormData({ ...formData, stock_actual: e.target.value })}
                  />
                  {errors?.stock_actual && <p className="text-destructive text-xs">{errors.stock_actual[0]}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="stock_minimo">Stock Mínimo *</Label>
                  <Input
                    id="stock_minimo"
                    name="stock_minimo"
                    type="number"
                    min="0"
                    required
                    value={formData.stock_minimo}
                    onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
                  />
                  {errors?.stock_minimo && <p className="text-destructive text-xs">{errors.stock_minimo[0]}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="stock_maximo">Stock Máximo *</Label>
                  <Input
                    id="stock_maximo"
                    name="stock_maximo"
                    type="number"
                    min="0"
                    required
                    value={formData.stock_maximo}
                    onChange={(e) => setFormData({ ...formData, stock_maximo: e.target.value })}
                  />
                  {errors?.stock_maximo && <p className="text-destructive text-xs">{errors.stock_maximo[0]}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="descripcion">Descripción *</Label>
                <textarea
                  id="descripcion"
                  required
                  name="descripcion"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground text-sm"
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                />
                {errors?.descripcion && <p className="text-destructive text-xs">{errors.descripcion[0]}</p>}
              </div>

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={fetcher.state !== 'idle'}>
                  {fetcher.state !== 'idle' ? 'Guardando...' : editId ? 'Actualizar' : 'Guardar'}
                </Button>
              </DialogFooter>
            </fetcher.Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = Object.fromEntries(formData);
  const intent = submission.intent;

  if (intent === "delete") {
    const id = Number(submission.id_producto);
    if (isNaN(id)) {
      return { error: "ID de producto inválido" };
    }
    const res = await productosAPI.delete(id);
    if (res.ok) {
      return { success: true };
    } else {
      return { error: res.error };
    }
  }

  // De lo contrario, es guardar/actualizar
  // Validamos con el esquema de Zod
  const result = ProductoSchema.safeParse(submission);

  if (!result.success) {
    // Retornamos los errores para que el formulario los muestre
    return { errors: result.error.flatten().fieldErrors };
  }

  const editId = submission.editId ? Number(submission.editId) : null;
  const res = editId
    ? await productosAPI.update(editId, result.data)
    : await productosAPI.create(result.data);

  if (res.ok) {
    return { success: true };
  } else {
    return { error: res.error };
  }
}
