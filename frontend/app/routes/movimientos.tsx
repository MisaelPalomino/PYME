import { useState } from 'react';
import { Plus, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import type { Movimiento } from '~/api/types';
import { mockMovimientos } from '~/dataMock'; // FIXME: Delete this
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { TableList, type Filter } from '~/components/Table';

const columnHelper = createColumnHelper<Movimiento>();

const columns = [
  columnHelper.accessor("producto_nombre", {
    header: "Producto",
    cell: (info) => (
      // <p className="text-xs text-muted-foreground font-mono">{m.sku}</p>
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
    header: "Cantidad",
    cell: (info) => {
      const m = info.row.original;
      return (
        <div className="px-4 py-3 text-center">
          <span className={m.tipo_movimiento === 'Entrada' ? 'text-green-600' : 'text-red-600'}>
            {m.tipo_movimiento === 'Entrada' ? '+' : '-'}{m.cantidad}
          </span>
        </div>
      );
    }
  }),
  columnHelper.accessor("fecha", {
    header: "Fecha",
    cell: (info) => (
      <div className="px-4 py-3 text-muted-foreground whitespace-nowrap">
        {format(info.getValue(), 'dd/MM/yyyy HH:mm', { locale: es })}
      </div>
    )
  }),
  columnHelper.display({
    header: "Observaciones",
    cell: (info) => (
      <div className="px-4 py-3 text-muted-foreground max-w-[160px] truncate">{info.row.original.observaciones}</div>
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

export default function Movements() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    productId: '', type: 'entrada' as 'entrada' | 'salida',
    quantity: 1, observations: '', reason: '',
  });

  function handleSave() {
    /*
    const product = products.find(p => p.id === form.productId);
    if (!product) return;
    const newMovement: Movement = {
      id: `m${Date.now()}`,
      productId: form.productId,
      productName: product.name,
      sku: product.sku,
      type: form.type,
      quantity: form.quantity,
      date: new Date(),
      userId: 'u3',
      userName: 'Carlos Mendoza',
      observations: form.observations,
      reason: form.reason || (form.type === 'entrada' ? 'Compra' : 'Venta'),
    };
    setItems(prev => [newMovement, ...prev]);
    setDialogOpen(false);
    setForm({ productId: '', type: 'entrada', quantity: 1, observations: '', reason: '' });
    */
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">Movimientos de Inventario</h1>
          <p className="text-sm text-muted-foreground">Registro de entradas y salidas de stock</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Registrar Movimiento
        </Button>
      </div>

      {/* Table */}
      <TableList columns={columns} data={mockMovimientos} filters={filters} />
      {/*
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Registrar Movimiento</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Producto</Label>
              <Select value={form.productId} onValueChange={v => setForm(f => ({ ...f, productId: v }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar producto" /></SelectTrigger>
                <SelectContent>
                  {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as 'entrada' | 'salida' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada (Compra)</SelectItem>
                    <SelectItem value="salida">Salida (Venta/Consumo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Cantidad</Label>
                <Input type="number" min={1} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: +e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Observaciones</Label>
              <Input value={form.observations} onChange={e => setForm(f => ({ ...f, observations: e.target.value }))} placeholder="Notas adicionales..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.productId}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      */}
    </div>
  );
}
