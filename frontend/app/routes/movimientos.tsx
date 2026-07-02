import { useState } from 'react';
import { Plus, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { FilterCard } from '~/components/FilterCard';

/*

        migrations.CreateModel(
            name='MovimientoInventario',
            fields=[
                ('id_movimiento', models.BigAutoField(primary_key=True, serialize=False)),
                ('tipo_movimiento', models.CharField(choices=[('entrada', 'Entrada'), ('salida', 'Salida')], max_length=255)),
                ('fecha', models.DateTimeField()),
                ('cantidad', models.BigIntegerField()),
                ('observaciones', models.TextField()),
                ('id_producto', models.ForeignKey(db_column='id_producto', on_delete=django.db.models.deletion.PROTECT, to='core.producto')),
                ('id_usuario', models.ForeignKey(db_column='id_usuario', on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL)),
            ],

*/

export default function Movements() {
  const [dialogOpen, setDialogOpen] = useState(false);
  /*const [items, setItems] = useState<Movement[]>(initialMovements);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [form, setForm] = useState({
    productId: '', type: 'entrada' as 'entrada' | 'salida',
    quantity: 1, observations: '', reason: '',
  });

  const filtered = items.filter(m => {
    const matchSearch = m.productName.toLowerCase().includes(search.toLowerCase()) || m.sku.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || m.type === typeFilter;
    return matchSearch && matchType;
  });

  function handleSave() {
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
  }*/

  function handleFilter(values: Record<string, string>) {

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

      <FilterCard onChange={handleFilter}>
        <FilterCard.Input name="search" placeholder="Buscar por producto o SKU" />
        <FilterCard.Combobox name="type" placeholder="Tipo" items={["Entradas", "Salidas"]}/>
      </FilterCard>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="text-left px-4 py-3 text-muted-foreground">Producto</th>
                  <th className="text-center px-4 py-3 text-muted-foreground">Tipo</th>
                  <th className="text-center px-4 py-3 text-muted-foreground">Cantidad</th>
                  <th className="text-left px-4 py-3 text-muted-foreground">Motivo</th>
                  <th className="text-left px-4 py-3 text-muted-foreground">Responsable</th>
                  <th className="text-left px-4 py-3 text-muted-foreground">Fecha</th>
                  <th className="text-left px-4 py-3 text-muted-foreground">Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {/*filtered.map(m => (
                  <tr key={m.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-foreground">{m.productName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{m.sku}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={m.type === 'entrada' ? 'outline' : 'secondary'} className="gap-1">
                        {m.type === 'entrada'
                          ? <ArrowDown className="w-3 h-3 text-green-500" />
                          : <ArrowUp className="w-3 h-3 text-red-500" />}
                        {m.type === 'entrada' ? 'Entrada' : 'Salida'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={m.type === 'entrada' ? 'text-green-600' : 'text-red-600'}>
                        {m.type === 'entrada' ? '+' : '-'}{m.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{m.reason}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.userName}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {format(m.date, 'dd/MM/yyyy HH:mm', { locale: es })}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[160px] truncate">{m.observations}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">No se encontraron movimientos</td></tr>
                )*/}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
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
    </div >
  );
}
