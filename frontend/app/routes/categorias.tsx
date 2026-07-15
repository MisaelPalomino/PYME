import { useState, useEffect } from 'react';
import type { ActionFunctionArgs } from "react-router";
import { useFetcher } from "react-router";
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from "~/api/categoria";
import type { Categoria } from '~/api/types';
import { Button } from '~/components/ui/button';
import { useAuth } from '~/context/AuthContext';
import type { Route } from "./+types/categorias";
import { Card, CardContent } from '~/components/ui/card';
import { Edit2, Tag, Plus, Trash2 } from 'lucide-react';
import { createColumnHelper } from '@tanstack/react-table';
import { TableCard, type Filter } from '~/components/Table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { CategoriaSchema } from '~/lib/schemas/categoria.schema';
import { toast } from 'sonner';

export async function loader() {
  const response = await getCategorias();
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

const filters: Filter[] = [
  {
    type: "input",
    columnName: "nombre",
    placeholder: "Buscar por nombre"
  }
];

export default function Categorias({ loaderData }: Route.ComponentProps) {
  const { user } = useAuth();
  const fetcher = useFetcher();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });

  const isAdmin = user?.rol?.toLowerCase() === 'administrador';

  const resetForm = () => {
    setFormData({ nombre: '', descripcion: '' });
    setEditId(null);
  };

  const openCreate = () => {
    if (!isAdmin) return;
    resetForm();
    setIsDialogOpen(true);
  };

  const openEdit = (categoria: Categoria) => {
    if (!isAdmin) return;
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
    });
    setEditId(categoria.id_categoria);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!isAdmin) {
      alert('No tienes permisos para realizar esta acción');
      return;
    }
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;
    fetcher.submit(
      { intent: "delete", id_categoria: id.toString() },
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
      toast.success("¡Se guardó la categoría correctamente!");
    }
  }, [fetcher.state, fetcher.data]);

  const errors = fetcher.data && (fetcher.data as any).errors;
  const generalError = fetcher.data && (fetcher.data as any).error;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Categorías</h1>
          <p className="text-sm text-muted-foreground">{loaderData.categorias.length} categorías registradas</p>
        </div>
        {isAdmin && (
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Categoría
          </Button>
        )}
      </div>

      {generalError && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
          {generalError}
        </div>
      )}

      <TableCard columns={columns} data={loaderData.categorias} filters={filters}>
        {(item) => (
          <Card key={item.id_categoria} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-accent rounded-lg">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                      title="Editar categoría"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id_categoria)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                      title="Eliminar categoría"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <h3 className="text-foreground font-semibold mb-1">{item.nombre}</h3>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{item.descripcion || 'Sin descripción'}</p>
            </CardContent>
          </Card>
        )}
      </TableCard>

      {/* Dialogo Formulario Categoría */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editId ? 'Editar Categoría' : 'Nueva Categoría'}
            </DialogTitle>
          </DialogHeader>

          <fetcher.Form method="post" className="space-y-4">
            {editId && <input type="hidden" name="editId" value={editId} />}
            <input type="hidden" name="intent" value={editId ? "update" : "create"} />

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
              <Label htmlFor="descripcion">Descripción</Label>
              <textarea
                id="descripcion"
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
    const id = Number(submission.id_categoria);
    if (isNaN(id)) {
      return { error: "ID de categoría inválido" };
    }
    try {
      const result = await deleteCategoria(id);
      if (result.ok) {
        return { success: true };
      } else {
        return { error: result.error || "Error al eliminar la categoría" };
      }
    } catch (error) {
      console.error(error);
      return { error: "Error al eliminar la categoría" };
    }
  }

  // Validamos con el esquema de Zod
  const result = CategoriaSchema.safeParse(submission);

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const editId = submission.editId ? Number(submission.editId) : null;
  try {
    if (editId) {
      const response = await updateCategoria(editId, result.data);
      if (!response.ok) {
        return { error: response.error || "Error al actualizar" };
      }
    } else {
      const response = await createCategoria(result.data);
      if (!response.ok) {
        return { error: response.error || "Error al crear" };
      }
    }
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Error al comunicarse con el servidor" };
  }
}