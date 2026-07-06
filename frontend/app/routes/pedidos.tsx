import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, X, CheckCircle, Mail, Copy, Check, Send, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '~/components/ui/dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useFetcher } from 'react-router';
import type { ActionFunctionArgs } from 'react-router';
import type { Route } from './+types/pedidos';
import { pedidosAPI, productosAPI, proveedoresAPI } from '~/api/api';
import { PedidoSchema } from '~/lib/schemas/pedido.schema';
import { toast } from 'sonner';

const statusConfig = {
  pendiente: { label: 'Pendiente', variant: 'secondary' as const, color: 'text-yellow-600' },
  enviado: { label: 'Enviado', variant: 'outline' as const, color: 'text-blue-600' },
  recibido: { label: 'Recibido', variant: 'outline' as const, color: 'text-green-600' },
  cancelado: { label: 'Cancelado', variant: 'destructive' as const, color: 'text-muted-foreground' },
};

type Order = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  supplierId: string;
  supplierName: string;
  quantity: number;
  status: 'pendiente' | 'enviado' | 'recibido' | 'cancelado';
  createdAt: Date;
  expectedDate: Date;
  userId: string;
  userName: string;
  notes?: string;
  unitPrice: number;
  receivedDate?: Date;
};

export async function loader() {
  const [
    { data: backendPedidos },
    { data: productos },
    { data: proveedores }
  ] = await Promise.all([
    pedidosAPI.getAll(),
    productosAPI.getAll(),
    proveedoresAPI.getAll()
  ]);

  return {
    backendPedidos,
    productos,
    proveedores
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = Object.fromEntries(formData);
  const intent = submission.intent;

  if (intent === 'delete') {
    const id = Number(submission.id_pedido);
    try {
      await pedidosAPI.delete(id);
      return { success: true };
    } catch (error: any) {
      console.error(error);
      return { error: error.response?.data?.error || 'Error al cancelar el pedido' };
    }
  }

  if (intent === 'send') {
    const id = Number(submission.id_pedido);
    try {
      await pedidosAPI.updateEstado(id, 'enviado');
      return { success: true };
    } catch (error: any) {
      console.error(error);
      return { error: error.response?.data?.error || 'Error al enviar el pedido' };
    }
  }

  if (intent === 'receive') {
    const id = Number(submission.id_pedido);
    try {
      await pedidosAPI.recibir(id);
      return { success: true };
    } catch (error: any) {
      console.error(error);
      return { error: error.response?.data?.error || 'Error al recibir el pedido' };
    }
  }

  // Validaciones con Zod
  const result = PedidoSchema.safeParse(submission);
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const payload = {
    id_proveedor: result.data.id_proveedor,
    id_usuario: 1, // Usuario por defecto para el registro
    detalles: [
      {
        id_producto: result.data.id_producto,
        cantidad: result.data.cantidad,
        precio_unitario: result.data.precio_unitario
      }
    ]
  };

  try {
    if (intent === 'edit') {
      const editId = Number(submission.editId);
      await pedidosAPI.delete(editId);
      await pedidosAPI.create(payload);
    } else {
      await pedidosAPI.create(payload);
    }
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.response?.data?.error || 'Error al comunicarse con el servidor' };
  }
}

export default function Orders({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [form, setForm] = useState({ productId: '', supplierId: '', quantity: 1, unitPrice: 0, notes: '' });
  const [emailOrder, setEmailOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  // Mapear productos y proveedores
  const products = loaderData.productos.map(p => ({
    id: p.id_producto.toString(),
    name: p.nombre,
    sku: p.sku,
    price: p.precio
  }));

  const suppliers = loaderData.proveedores.map(s => ({
    id: s.id_proveedor.toString(),
    name: s.nombre,
    email: s.correo,
    contact: s.contacto,
    leadTime: s.lead_time_dias
  }));

  // Mapear pedidos desde el backend al tipo local
  const orders: Order[] = loaderData.backendPedidos.map(o => {
    const firstDetail = o.detalles && o.detalles.length > 0 ? o.detalles[0] : null;
    const productName = firstDetail ? firstDetail.producto_nombre || 'Producto' : 'Sin productos';
    const sku = firstDetail ? firstDetail.id_producto.toString() : '';

    const product = loaderData.productos.find(p => p.id_producto === firstDetail?.id_producto);
    const realProductName = product ? product.nombre : productName;
    const realSku = product ? product.sku : sku;

    const expectedDate = o.fecha_esperada ? new Date(o.fecha_esperada) : (o.fecha_envio ? new Date(o.fecha_envio) : new Date(o.fecha_creacion));

    return {
      id: o.id_pedido.toString(),
      productId: firstDetail ? firstDetail.id_producto.toString() : '',
      productName: realProductName,
      sku: realSku,
      supplierId: o.id_proveedor.toString(),
      supplierName: o.proveedor_nombre || 'Proveedor',
      quantity: firstDetail ? firstDetail.cantidad : 0,
      status: o.estado as 'pendiente' | 'enviado' | 'recibido' | 'cancelado',
      createdAt: new Date(o.fecha_creacion),
      expectedDate: expectedDate,
      userId: o.id_usuario.toString(),
      userName: o.usuario_nombre || 'Usuario',
      unitPrice: firstDetail ? Number(firstDetail.precio_unitario) : 0,
      receivedDate: o.fecha_recepcion ? new Date(o.fecha_recepcion) : undefined,
    };
  });

  const filtered = orders.filter(o => {
    const matchSearch = o.productName.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchSupplier = supplierFilter === 'all' || o.supplierId === supplierFilter;
    return matchSearch && matchStatus && matchSupplier;
  });

  function openCreate() {
    setEditOrder(null);
    setForm({ productId: '', supplierId: '', quantity: 1, unitPrice: 0, notes: '' });
    setDialogOpen(true);
  }

  function openEdit(o: Order) {
    if (o.status !== 'pendiente') return;
    setEditOrder(o);
    setForm({ productId: o.productId, supplierId: o.supplierId, quantity: o.quantity, unitPrice: o.unitPrice, notes: o.notes || '' });
    setDialogOpen(true);
  }

  function handleSave() {
    fetcher.submit(
      {
        intent: editOrder ? 'edit' : 'create',
        editId: editOrder?.id || '',
        id_proveedor: form.supplierId,
        id_producto: form.productId,
        cantidad: form.quantity.toString(),
        precio_unitario: form.unitPrice.toString(),
      },
      { method: 'post' }
    );
  }

  function handleCancelOrder(id: string) {
    if (confirm('¿Estás seguro de cancelar este pedido?')) {
      fetcher.submit(
        { intent: 'delete', id_pedido: id },
        { method: 'post' }
      );
    }
  }

  function handleSendOrder(id: string) {
    fetcher.submit(
      { intent: 'send', id_pedido: id },
      { method: 'post' }
    );
    setEmailOrder(null);
  }

  function handleMarkReceived(id: string) {
    fetcher.submit(
      { intent: 'receive', id_pedido: id },
      { method: 'post' }
    );
  }

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return;
    if (fetcher.data.success) {
      setDialogOpen(false);
      setForm({ productId: '', supplierId: '', quantity: 1, unitPrice: 0, notes: '' });
      toast.success('¡Operación realizada correctamente!');
    } else if (fetcher.data.error) {
      toast.error(fetcher.data.error);
    }
  }, [fetcher.state, fetcher.data]);

  const isOverdue = (o: Order) => o.status === 'enviado' && new Date() > o.expectedDate;

  function buildEmailTemplate(o: Order): string {
    const supplier = suppliers.find(s => s.id === o.supplierId);
    return `Para: ${supplier?.email ?? ''}
Asunto: Pedido de reposición — ${o.productName} (${o.id.toUpperCase()})

Estimado/a ${supplier?.contact ?? supplier?.name ?? ''},

Por medio del presente, nos comunicamos para gestionar el siguiente pedido de reposición:

  Pedido ID   : ${o.id.toUpperCase()}
  Producto    : ${o.productName}
  SKU         : ${o.sku}
  Cantidad    : ${o.quantity} unidades
  Precio unit.: S/ ${o.unitPrice.toFixed(2)}
  Total       : S/ ${(o.quantity * o.unitPrice).toFixed(2)}
  Fecha esp.  : ${format(o.expectedDate, "dd 'de' MMMM 'de' yyyy", { locale: es })}
  Lead time   : ${supplier?.leadTime ?? '—'} días

${o.notes ? `Notas adicionales: ${o.notes}\n\n` : ''}Agradecemos confirmar la disponibilidad y la fecha de despacho a la brevedad posible.

Atentamente,
${o.userName}
Departamento de Compras — StockMaster Pro`;
  }

  function handleCopyEmail() {
    if (!emailOrder) return;
    navigator.clipboard.writeText(buildEmailTemplate(emailOrder));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const errors = fetcher.data && (fetcher.data as any).errors;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">Pedidos a Proveedores</h1>
          <p className="text-sm text-muted-foreground">{orders.filter(o => o.status === 'pendiente').length} pedidos pendientes</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Pedido
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por producto o ID..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="enviado">Enviado</SelectItem>
                <SelectItem value="recibido">Recibido</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder="Proveedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los proveedores</SelectItem>
                {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="text-left px-4 py-3 text-muted-foreground">ID / Producto</th>
                  <th className="text-left px-4 py-3 text-muted-foreground">Proveedor</th>
                  <th className="text-center px-4 py-3 text-muted-foreground">Cant.</th>
                  <th className="text-right px-4 py-3 text-muted-foreground">Total</th>
                  <th className="text-center px-4 py-3 text-muted-foreground">F. Esperada</th>
                  <th className="text-center px-4 py-3 text-muted-foreground">Estado</th>
                  <th className="text-center px-4 py-3 text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className={`border-b border-border/50 hover:bg-accent/30 transition-colors ${isOverdue(o) ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="text-foreground font-mono text-xs">{o.id.toUpperCase()}</p>
                      <p className="text-foreground mt-0.5">{o.productName}</p>
                      {isOverdue(o) && (
                        <p className="text-xs text-yellow-600 mt-0.5 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-yellow-600" />
                          Pedido vencido
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{o.supplierName}</td>
                    <td className="px-4 py-3 text-center text-foreground">{o.quantity}</td>
                    <td className="px-4 py-3 text-right text-foreground">S/ {(o.quantity * o.unitPrice).toFixed(2)}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground whitespace-nowrap">
                      {format(o.expectedDate, 'dd/MM/yyyy', { locale: es })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={statusConfig[o.status].variant}>{statusConfig[o.status].label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => { setEmailOrder(o); setCopied(false); }}
                          className="p-1.5 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                          title="Generar plantilla de correo"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                        {o.status === 'pendiente' && (
                          <>
                            <button onClick={() => openEdit(o)} className="p-1.5 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground" title="Editar">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleCancelOrder(o.id)} className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive" title="Cancelar">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {o.status === 'enviado' && (
                          <button onClick={() => handleMarkReceived(o.id)} className="p-1.5 rounded hover:bg-green-50 transition-colors text-muted-foreground hover:text-green-600" title="Marcar recibido">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No se encontraron pedidos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Email template dialog */}
      <Dialog open={!!emailOrder} onOpenChange={open => { if (!open) setEmailOrder(null); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Plantilla de Correo — Pedido {emailOrder?.id.toUpperCase()}
            </DialogTitle>
          </DialogHeader>
          {emailOrder && (
            <>
              <div className="bg-muted/40 border border-border rounded-lg p-4 text-xs font-mono whitespace-pre-wrap leading-relaxed text-foreground max-h-80 overflow-y-auto">
                {buildEmailTemplate(emailOrder)}
              </div>
              <p className="text-xs text-muted-foreground">
                Copia esta plantilla y envíala desde tu cliente de correo. El sistema no realiza envíos automáticos.
              </p>
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailOrder(null)}>Cerrar</Button>
            {emailOrder && emailOrder.status === 'pendiente' && (
              <Button onClick={() => handleSendOrder(emailOrder.id)} className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Send className="w-4 h-4" />
                Marcar como Enviado
              </Button>
            )}
            <Button onClick={handleCopyEmail} className="gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado!' : 'Copiar plantilla'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editOrder ? 'Editar Pedido' : 'Nuevo Pedido'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Producto</Label>
              <Select value={form.productId} onValueChange={v => {
                const prod = products.find(p => p.id === v);
                setForm(f => ({ ...f, productId: v, unitPrice: prod ? prod.price : 0 }));
              }}>
                <SelectTrigger><SelectValue placeholder="Seleccionar producto" /></SelectTrigger>
                <SelectContent>
                  {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors?.id_producto && <p className="text-destructive text-xs">{errors.id_producto[0]}</p>}
            </div>
            <div className="space-y-1">
              <Label>Proveedor</Label>
              <Select value={form.supplierId} onValueChange={v => setForm(f => ({ ...f, supplierId: v }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar proveedor" /></SelectTrigger>
                <SelectContent>
                  {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors?.id_proveedor && <p className="text-destructive text-xs">{errors.id_proveedor[0]}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Cantidad</Label>
                <Input type="number" min={1} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: +e.target.value }))} />
                {errors?.cantidad && <p className="text-destructive text-xs">{errors.cantidad[0]}</p>}
              </div>
              <div className="space-y-1">
                <Label>Precio unitario (S/)</Label>
                <Input type="number" min={0} step="0.01" value={form.unitPrice} onChange={e => setForm(f => ({ ...f, unitPrice: +e.target.value }))} />
                {errors?.precio_unitario && <p className="text-destructive text-xs">{errors.precio_unitario[0]}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.productId || !form.supplierId || fetcher.state !== 'idle'}>
              {fetcher.state !== 'idle' ? 'Guardando...' : editOrder ? 'Actualizar' : 'Crear Pedido'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
