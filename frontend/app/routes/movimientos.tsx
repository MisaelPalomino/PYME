import { useState, useEffect } from 'react';
import { Plus, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import * as movimientosAPI from '~/api/movimiento';
import { MovimientoSchema, type Movimiento } from '~/api/movimiento';
import * as productosAPI from '~/api/producto';
import type { Producto } from '~/api/producto';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { useFetcher } from "react-router";
import { useAuth } from '~/context/AuthContext';
import { toast } from 'sonner';

import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { createSortableHeader, TableList, type Filter } from '~/components/Table';
import type { Route } from "./+types/movimientos";

export async function clientLoader() {
  const [
    movimientosRes,
    productosRes
  ] = await Promise.all([
    movimientosAPI.get_all(),
    productosAPI.get_all()
  ]);

  if (!movimientosRes.ok) throw new Error(movimientosRes.error);
  if (!productosRes.ok) throw new Error(productosRes.error);

  return {
    movimientos: movimientosRes.data,
    productos: productosRes.data
  };
}

const columnHelper = createColumnHelper<Movimiento>();

const columns = [
  columnHelper.accessor("producto_nombre", {
    header: createSortableHeader("Producto"),
    size: NaN,
    cell: (info) => (
      <p className="px-4 py-3 text-foreground">{info.getValue()}</p>
    )
  }),
  columnHelper.accessor("tipo_movimiento", {
    header: "Tipo",
    cell: (info) => {
      const m = info.row.original;
      return (
        <div className="px-4 py-3 text-center">
          <Badge variant={m.tipo_movimiento === "Entrada" ? 'outline' : 'secondary'} className="gap-1">
            {m.tipo_movimiento === 'Entrada'
              ? <ArrowDown className="w-3 h-3 text-green-500" />
              : <ArrowUp className="w-3 h-3 text-red-500" />}
            {m.tipo_movimiento}
          </Badge>
        </div>
      );
    }
  }),
  columnHelper.accessor("cantidad", {
    header: createSortableHeader("Cantidad"),
    cell: (info) => {
      const m = info.row.original;
      return (
        <div className="px-4 py-3 text-center font-medium">
          <span className={m.tipo_movimiento === 'Entrada' ? 'text-green-600' : 'text-red-600'}>
            {m.tipo_movimiento === 'Entrada' ? '+' : '-'}{m.cantidad}
          </span>
        </div>
      );
    }
  }),
  columnHelper.accessor("fecha", {
    header: createSortableHeader("Fecha"),
    sortingFn: (rowA, rowB) => {
      const dateA = rowA.original.fecha.getTime();
      const dateB = rowB.original.fecha.getTime();

      return dateA - dateB;
    },
    cell: (info) => (
      <div className="px-4 py-3 text-muted-foreground whitespace-nowrap">
        {format(info.getValue(), 'dd/MM/yyyy HH:mm', { locale: es })}
      </div>
    )
  }),
  columnHelper.display({
    id: "observaciones",
    header: "Observaciones",
    size: 400,
    cell: (info) => (
      <div className="px-4 py-3 text-muted-foreground">{info.row.original.observaciones}</div>
    )
  })
];

const filters: Filter[] = [
  {
    type: "input",
    columnName: "producto_nombre",
    placeholder: "Buscar por nombre...",
  },
  {
    type: "combobox",
    columnName: "tipo_movimiento",
    placeholder: "Tipo",
    items: ["Entrada", "Salida"]
  }
];

export default function Movements({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();
  const { session } = useAuth();
  const user = session?.usuario;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    id_producto: '',
    tipo_movimiento: 'Entrada',
    cantidad: '1',
    observaciones: '',
  });

  const resetForm = () => {
    setFormData({
      id_producto: '',
      tipo_movimiento: 'Entrada',
      cantidad: '1',
      observaciones: '',
    });
  };

  // Cierra el diálogo tras un envío exitoso
  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;

    if (fetcher.data.success) {
      setDialogOpen(false);
      resetForm();
      toast.success("¡Se registró el movimiento de inventario correctamente!");
    } else if (fetcher.data.error) {
      toast.error(fetcher.data.error);
    }
  }, [fetcher.state, fetcher.data]);

  const errors = fetcher.data && (fetcher.data as { errors?: Record<string, string[]>; error?: string }).errors;
  const generalError = fetcher.data && (fetcher.data as { errors?: Record<string, string[]>; error?: string }).error;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Movimientos de Inventario</h1>
          <p className="text-sm text-muted-foreground">Registro de entradas y salidas de stock</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Registrar Movimiento
        </Button>
      </div>

      {generalError && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
          {generalError}
        </div>
      )}

      {/* Table */}
      <TableList columns={columns} data={loaderData.movimientos} filters={filters} />

      {/* Dialogo Formulario Registro Movimiento */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Movimiento</DialogTitle>
          </DialogHeader>

          <fetcher.Form method="post" className="space-y-4">
            <input type="hidden" name="id_usuario" value={user?.id_usuario || 1} />

            <div className="space-y-1">
              <Label htmlFor="id_producto">Producto *</Label>
              <select
                id="id_producto"
                name="id_producto"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground text-sm h-10"
                required
                value={formData.id_producto}
                onChange={(e) => setFormData({ ...formData, id_producto: e.target.value })}
              >
                <option value="">Seleccionar producto...</option>
                {loaderData.productos.map((p: Producto) => (
                  <option key={p.id_producto} value={p.id_producto}>
                    {p.nombre} ({p.sku}) — Stock: {p.stock_actual}
                  </option>
                ))}
              </select>
              {errors?.id_producto && <p className="text-destructive text-xs">{errors.id_producto[0]}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="tipo_movimiento">Tipo *</Label>
                <select
                  id="tipo_movimiento"
                  name="tipo_movimiento"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground text-sm h-10"
                  required
                  value={formData.tipo_movimiento}
                  onChange={(e) => setFormData({ ...formData, tipo_movimiento: e.target.value })}
                >
                  <option value="Entrada">Entrada (Compra)</option>
                  <option value="Salida">Salida (Venta/Consumo)</option>
                </select>
                {errors?.tipo_movimiento && <p className="text-destructive text-xs">{errors.tipo_movimiento[0]}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="cantidad">Cantidad *</Label>
                <Input
                  id="cantidad"
                  name="cantidad"
                  type="number"
                  min="1"
                  required
                  value={formData.cantidad}
                  onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                />
                {errors?.cantidad && <p className="text-destructive text-xs">{errors.cantidad[0]}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="observaciones">Observaciones</Label>
              <textarea
                id="observaciones"
                name="observaciones"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground text-sm"
                rows={3}
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                placeholder="Notas adicionales..."
              />
              {errors?.observaciones && <p className="text-destructive text-xs">{errors.observaciones[0]}</p>}
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={fetcher.state !== 'idle'}>
                {fetcher.state !== 'idle' ? 'Guardando...' : 'Registrar'}
              </Button>
            </DialogFooter>
          </fetcher.Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const submission = Object.fromEntries(formData);

  const result = MovimientoSchema.safeParse(submission);
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const userId = submission.id_usuario ? Number(submission.id_usuario) : 1;
  const res = await movimientosAPI.create({
    ...result.data,
    id_usuario: userId
  });

  if (res.ok) {
    return { success: true };
  } else {
    return { error: res.error };
  }
}
