import { useState, useEffect } from 'react';
import type { ActionFunctionArgs } from "react-router";
import { useFetcher } from "react-router";
import { Plus, Edit2, Trash2, Mail, Phone, Clock, FileText } from 'lucide-react';
import type { Route } from "./+types/proveedores";
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { proveedoresAPI } from '~/api/api';
import type { Proveedor } from '~/api/types';
import { ProveedorSchema } from '~/lib/schemas/proveedor.schema';
import { createColumnHelper } from '@tanstack/react-table';
import { TableCard, type Filter } from '~/components/Table';
import { Badge } from '~/components/ui/badge';
import { toast } from 'sonner';

export async function loader({ }: Route.LoaderArgs) {
  const response = await proveedoresAPI.getAll();
  return {
    proveedores: response.data
  };
}

const columnHelper = createColumnHelper<Proveedor>();

const columns = [
  columnHelper.accessor("nombre", {
    enableColumnFilter: true
  })
];

const filters: Filter[] = [
  {
    type: "input",
    columnName: "nombre",
    placeholder: "Buscar por nombre..."
  }
];

export default function Suppliers({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    contacto: '',
    correo: '',
    telefono: '',
    lead_time_dias: '',
  });

  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailSupplier, setEmailSupplier] = useState<Proveedor | null>(null);

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

  function openCreate() {
    resetForm();
    setDialogOpen(true);
  }

  function openEdit(s: Proveedor) {
    setFormData({
      nombre: s.nombre,
      contacto: s.contacto,
      correo: s.correo,
      telefono: s.telefono,
      lead_time_dias: s.lead_time_dias.toString(),
    });
    setEditId(s.id_proveedor);
    setDialogOpen(true);
  }

  function handleDelete(id: number) {
    if (!confirm('¿Estás seguro de eliminar este proveedor?')) return;
    fetcher.submit(
      { intent: "delete", id_proveedor: id.toString() },
      { method: "post" }
    );
  }

  // Cierra el diálogo tras un envío exitoso
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data && (fetcher.data as any).success) {
      setDialogOpen(false);
      resetForm();
    }
  }, [fetcher.state, fetcher.data]);

  function openEmailTemplate(s: Proveedor) {
    setEmailSupplier(s);
    setEmailDialogOpen(true);
  }

  const errors = fetcher.data && (fetcher.data as any).errors;
  const generalError = fetcher.data && (fetcher.data as any).error;

  function getComplianceColor(rate: number) {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 80) return 'text-yellow-600';
    return 'text-destructive';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Proveedores</h1>
          <p className="text-sm text-muted-foreground">{loaderData.proveedores.length} proveedores registrados</p>
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

      <TableCard columns={columns} data={loaderData.proveedores} filters={filters}>
        {(item) => (
          <Card key={item.id_proveedor} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">{item.nombre}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.contacto}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEmailTemplate(item)}
                    className="p-1.5 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                    title="Plantilla de correo"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openEdit(item)}
                    className="p-1.5 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                    title="Editar proveedor"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id_proveedor)}
                    className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                    title="Eliminar proveedor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-3 h-3" /> {item.correo}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-3 h-3" /> {item.telefono}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-3 h-3" /> Lead time: {item.lead_time_dias} días
                </div>

                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Cumplimiento</span>
                    <span className={`text-xs ${getComplianceColor(item.porcentaje_cumplimiento)}`}>{item.porcentaje_cumplimiento}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.porcentaje_cumplimiento >= 90 ? 'bg-green-500' : item.porcentaje_cumplimiento >= 80 ? 'bg-yellow-500' : 'bg-destructive'}`}
                      style={{ width: `${item.porcentaje_cumplimiento}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {item.categorias.map(c => (
                    <Badge key={c.id_categoria} variant="outline" className="text-xs">{c.nombre}</Badge>
                  ))}
                  {item.categorias.length > 3 && (
                    <Badge variant="outline" className="text-xs">+{item.categorias.length - 3} más</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </TableCard>

      {/* Dialogo Crear/Editar */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
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
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
              {errors?.nombre && <p className="text-destructive text-xs">{errors.nombre[0]}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="contacto">Nombre de Contacto *</Label>
              <Input
                id="contacto"
                name="contacto"
                required
                value={formData.contacto}
                onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
              />
              {errors?.contacto && <p className="text-destructive text-xs">{errors.contacto[0]}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="correo">Correo Electrónico *</Label>
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
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input
                id="telefono"
                name="telefono"
                required
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
              {errors?.telefono && <p className="text-destructive text-xs">{errors.telefono[0]}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="lead_time_dias">Tiempo de Entrega (días) *</Label>
              <Input
                id="lead_time_dias"
                name="lead_time_dias"
                type="number"
                min="1"
                required
                value={formData.lead_time_dias}
                onChange={(e) => setFormData({ ...formData, lead_time_dias: e.target.value })}
              />
              {errors?.lead_time_dias && <p className="text-destructive text-xs">{errors.lead_time_dias[0]}</p>}
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={fetcher.state !== 'idle'}>
                {fetcher.state !== 'idle' ? 'Guardando...' : editId ? 'Actualizar' : 'Guardar'}
              </Button>
            </DialogFooter>
          </fetcher.Form>
        </DialogContent>
      </Dialog>

      {/* Email template dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Plantilla de Correo — {emailSupplier?.correo}
            </DialogTitle>
          </DialogHeader>
          <div className="bg-muted/30 rounded-lg p-4 text-sm space-y-3 font-mono text-xs text-foreground">
            <p><strong>Para:</strong> {emailSupplier?.correo}</p>
            <p><strong>Asunto:</strong> Solicitud de reposición de stock</p>
            <hr className="border-border" />
            <p>Estimado/a {emailSupplier?.contacto || emailSupplier?.nombre},</p>
            <p>Por medio del presente, nos dirigimos a usted para solicitar la reposición de stock para los productos que manejamos con su empresa.</p>
            <p>Agradecemos su pronta atención y confirmación de disponibilidad.</p>
            <p>Atentamente,<br />Equipo de Compras — StockMaster Pro</p>
          </div>
          <p className="text-xs text-muted-foreground">¡Copia este texto y envíalo!</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>Cerrar</Button>
            <Button onClick={() => { navigator.clipboard.writeText(`Estimado/a ${emailSupplier?.contacto || emailSupplier?.nombre},\n\nPor medio del presente, nos dirigimos a usted para solicitar la reposición de stock para los productos que manejamos con su empresa.\n\nAgradecemos su pronta atención y confirmación de disponibilidad.\n\nAtentamente,\nEquipo de Compras — StockMaster Pro`); setEmailDialogOpen(false); toast.success("¡Email copiado!") }}>
              Copiar plantilla
            </Button>
          </DialogFooter>
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
      await proveedoresAPI.delete(id);
      return { success: true };
    } catch (error) {
      console.error(error);
      return { error: "Error al eliminar el proveedor" };
    }
  }

  // Validamos con el esquema de Zod
  const result = ProveedorSchema.safeParse(submission);

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const editId = submission.editId ? Number(submission.editId) : null;
  try {
    if (editId) {
      await proveedoresAPI.update(editId, result.data);
    } else {
      await proveedoresAPI.create(result.data);
    }
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Error al comunicarse con el servidor" };
  }
}
