import { useState, useEffect, useMemo } from 'react';
import type { ActionFunctionArgs } from "react-router";
import { useFetcher } from "react-router";
import { Button } from '~/components/ui/button';
import type { Route } from "./+types/proveedores";
import { Edit2, Plus, Trash2, Truck } from 'lucide-react';
import { createColumnHelper } from "@tanstack/react-table";
import { createSortableHeader, TableList, type Filter } from '~/components/Table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { toast } from 'sonner';
import { getProveedores, createProveedor, updateProveedor, deleteProveedor, type Proveedor } from '~/api/proveedor';
import { ProveedorRequestSchema } from '~/api/proveedor';

type ProveedorFormData = {
  nombre: string;
  contacto: string;
  correo: string;
  telefono: string;
  lead_time_dias: string;
}

const columnHelper = createColumnHelper<Proveedor>();

export async function loader() {
  const { data: proveedores } = await getProveedores();
  return { proveedores };
}

export default function Proveedores({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [formData, setFormData] = useState<ProveedorFormData>({
    nombre: '',
    contacto: '',
    correo: '',
    telefono: '',
    lead_time_dias: '',
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      contacto: '',
      correo: '',
      telefono: '',
      lead_time_dias: '',
    });
    setEditId(null);
  };

  const openCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEdit = (proveedor: Proveedor) => {
    setFormData({
      nombre: proveedor.nombre,
      contacto: proveedor.contacto || '',
      correo: proveedor.correo || '',
      telefono: proveedor.telefono || '',
      lead_time_dias: proveedor.lead_time_dias.toString(),
    });
    setEditId(proveedor.id_proveedor);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este proveedor?')) return;
    fetcher.submit(
      { intent: "delete", id_proveedor: id.toString() },
      { method: "post" }
    );
  };

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;
    setIsDialogOpen(false);
    resetForm();

    if (fetcher.data.success) {
      toast.success("¡Se guardó el proveedor correctamente!");
    } else if (fetcher.data.error) {
      toast.error(fetcher.data.error);
    }
  }, [fetcher.state, fetcher.data]);

  const columns = useMemo(() => [
    columnHelper.accessor("nombre", {
      header: createSortableHeader("Nombre"),
      enableSorting: true,
      cell: (info) => <div className="px-4 py-3 font-medium">{info.getValue()}</div>
    }),
    columnHelper.accessor("contacto", {
      header: createSortableHeader("Contacto"),
      cell: (info) => <div className="px-4 py-3 text-muted-foreground">{info.getValue()}</div>
    }),
    columnHelper.accessor("correo", {
      header: createSortableHeader("Correo"),
      cell: (info) => <div className="px-4 py-3 text-muted-foreground">{info.getValue()}</div>
    }),
    columnHelper.accessor("telefono", {
      header: createSortableHeader("Teléfono"),
      cell: (info) => <div className="px-4 py-3 text-muted-foreground">{info.getValue()}</div>
    }),
    columnHelper.accessor("lead_time_dias", {
      header: createSortableHeader("Lead Time"),
      cell: (info) => <div className="px-4 py-3 text-center">{info.getValue()} días</div>
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: (info) => {
        const proveedor = info.row.original;
        return (
          <div className="px-4 py-3">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => openEdit(proveedor)}
                className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                title="Editar proveedor"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(proveedor.id_proveedor)}
                className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                title="Eliminar proveedor"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      }
    })
  ], []);

  const filters: Filter[] = [
    {
      type: "input",
      columnName: "nombre",
      placeholder: "Buscar por nombre..."
    }
  ];

  const errors = fetcher.data && (fetcher.data as any).errors;
  const generalError = fetcher.data && (fetcher.data as any).error;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Proveedores</h1>
          <p className="text-sm text-muted-foreground">{loaderData?.proveedores?.length || 0} proveedores registrados</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proveedor
        </Button>
      </div>

      {generalError && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
          {generalError}
        </div>
      )}

      <TableList data={loaderData?.proveedores || []} columns={columns} filters={filters} defaultSort={[{ id: "nombre", desc: false }]} />

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editId ? 'Editar Proveedor' : 'Nuevo Proveedor'}
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
              <Label htmlFor="contacto">Contacto</Label>
              <Input
                id="contacto"
                name="contacto"
                type="text"
                value={formData.contacto}
                onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
              />
              {errors?.contacto && <p className="text-destructive text-xs">{errors.contacto[0]}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="correo">Correo *</Label>
              <Input
                id="correo"
                name="correo"
                type="email"
                required
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
              />
              {errors?.correo && <p className="text-destructive text-xs">{errors.correo[0]}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                name="telefono"
                type="text"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
              {errors?.telefono && <p className="text-destructive text-xs">{errors.telefono[0]}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="lead_time_dias">Lead Time (días) *</Label>
              <Input
                id="lead_time_dias"
                name="lead_time_dias"
                type="number"
                min="0"
                required
                value={formData.lead_time_dias}
                onChange={(e) => setFormData({ ...formData, lead_time_dias: e.target.value })}
              />
              {errors?.lead_time_dias && <p className="text-destructive text-xs">{errors.lead_time_dias[0]}</p>}
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
    const id = Number(submission.id_proveedor);
    if (isNaN(id)) {
      return { error: "ID de proveedor inválido" };
    }
    try {
      const result = await deleteProveedor(id);
      if (result.ok) {
        return { success: true };
      } else {
        return { error: result.error || "Error al eliminar el proveedor" };
      }
    } catch (error) {
      return { error: "Error al eliminar el proveedor" };
    }
  }

  const result = ProveedorRequestSchema.safeParse(submission);

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const editId = submission.editId ? Number(submission.editId) : null;
  try {
    if (editId) {
      const response = await updateProveedor(editId, result.data);
      if (!response.ok) {
        return { error: response.error || "Error al actualizar" };
      }
    } else {
      const response = await createProveedor(result.data);
      if (!response.ok) {
        return { error: response.error || "Error al crear" };
      }
    }
    return { success: true };
  } catch (error) {
    return { error: "Error al comunicarse con el servidor" };
  }
}