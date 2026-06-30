import { useState } from 'react';
import { Plus, Edit2, Trash2, Mail, Phone, Clock, TrendingUp, FileText } from 'lucide-react';
// import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
// import { Badge } from '../components/ui/badge';
// import { Button } fr|om '../components/ui/button';
// import { Input } from '../components/ui/input';
// import { Label } from '../components/ui/label';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
// import { suppliers as initial, orders, products, Supplier } from '../data/mockData';
// import { format } from 'date-fns';
// import { es } from 'date-fns/locale';
import type { Route } from "./+types/proveedores";
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';

type Supplier = {
  id_proveedor: number,
  nombre: string,
  contacto: string,
  correo: string,
  telefono: string,
  lead_time_dias: number,
  activo: boolean
}

// TODO: Change this to database
// Hace una llamada al Database
export async function loader({}: Route.LoaderArgs): Promise<Supplier[]> {
  return [{
    id_proveedor: 1,
    activo: true,
    contacto: "+51987654321",
    correo: "example@email.com",
    lead_time_dias: 12,
    nombre: "Sistemas UNSA",
    telefono: "?????"
  }];
}

export default function Suppliers({loaderData}: Route.ComponentProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(loaderData);
  const [dialogOpen, setDialogOpen] = useState(false);
  // const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState<Supplier>();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailSupplier, setEmailSupplier] = useState<Supplier | null>(null);

  function openCreate() {
    /*setEditing(null);
    setForm({});
    setDialogOpen(true);*/
  }

  function openEdit(s: Supplier) {
    /*setEditing(s);
    setForm({ name: s.name, contact: s.contact, email: s.email, phone: s.phone, leadTime: s.leadTime });
    setDialogOpen(true);*/
  }

  function handleSave() {
    /*if (editing) {
      setSuppliers(prev => prev.map(s => s.id === editing.id ? { ...s, ...form } : s));
    } else {
      setSuppliers(prev => [...prev, { id: `s${Date.now()}`, ...form, totalOrders: 0, onTimeOrders: 0, complianceRate: 0, products: [], createdAt: new Date() }]);
    }*/
    setDialogOpen(false);
  }

  function openEmailTemplate(s: Supplier) {
    setEmailSupplier(s);
    setEmailDialogOpen(true);
  }

  // const criticalProduct = products.find(p => p.status === 'critical');
  // const suggestedQty = criticalProduct ? criticalProduct.maxStock - criticalProduct.stock : 0;

  const getComplianceColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-yellow-600';
    return 'text-destructive';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">Proveedores</h1>
          <p className="text-sm text-muted-foreground">{suppliers.length} proveedores registrados</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proveedor
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {suppliers.map(s => {
          // const supplierOrders = orders.filter(o => o.supplierId === s.id);
          return (
            <Card key={s.id_proveedor} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm">{s.nombre}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.contacto}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEmailTemplate(s)} className="p-1.5 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground" title="Plantilla de correo">
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => openEdit(s)} className="p-1.5 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-3 h-3" /> {s.correo}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-3 h-3" /> {s.telefono}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-3 h-3" /> Lead time: {s.lead_time_dias} días
                  </div>
                </div>

                {
                  /*
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Cumplimiento</span>
                    <span className={`text-xs ${getComplianceColor(s.complianceRate)}`}>{s.complianceRate}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${s.complianceRate >= 95 ? 'bg-green-500' : s.complianceRate >= 85 ? 'bg-yellow-500' : 'bg-destructive'}`}
                      style={{ width: `${s.complianceRate}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                    <span>{s.onTimeOrders}/{s.totalOrders} pedidos a tiempo</span>
                    <span>{supplierOrders.length} pedidos totales</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {s.products.slice(0, 3).map(pid => {
                    const p = products.find(pr => pr.id === pid);
                    return p ? (
                      <Badge key={pid} variant="outline" className="text-xs">{p.name.split(' ').slice(0, 2).join(' ')}</Badge>
                    ) : null;
                  })}
                  {s.products.length > 3 && (
                    <Badge variant="outline" className="text-xs">+{s.products.length - 3} más</Badge>
                  )}
                </div>
                  */
                }
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create/Edit dialog */}
      {
      /*
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Editar Proveedor' : 'Nuevo Proveedor'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            {(['name', 'contact', 'email', 'phone'] as const).map(field => (
              <div key={field} className="space-y-1">
                <Label>{field === 'name' ? 'Nombre' : field === 'contact' ? 'Contacto' : field === 'email' ? 'Correo' : 'Teléfono'}</Label>
                <Input
                  value={form[field]}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  placeholder={field === 'email' ? 'correo@empresa.com' : field === 'phone' ? '+51 9XX XXX XXX' : ''}
                />
              </div>
            ))}
            <div className="space-y-1">
              <Label>Lead Time (días)</Label>
              <Input type="number" min={1} value={form.leadTime} onChange={e => setForm(f => ({ ...f, leadTime: +e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.name}>{editing ? 'Guardar' : 'Crear'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      */
      }

      {/* Email template dialog */}
      {
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Plantilla de Correo — {emailSupplier?.correo}
            </DialogTitle>
          </DialogHeader>
          <div className="bg-muted/30 rounded-lg p-4 text-sm space-y-3 font-mono text-xs">
            <p>Para: {emailSupplier?.correo}</p>
            <p>Asunto: Solicitud de reposición de stock</p>
            <hr className="border-border" />
            <p>Estimado/a {emailSupplier?.nombre},</p>
            <p>Por medio del presente, nos dirigimos a usted para solicitar la reposición urgente del siguiente producto:</p>
            <p>Agradecemos su pronta atención y confirmación de disponibilidad.</p>
            <p>Atentamente,<br/>Equipo de Compras — StockMaster Pro</p>
          </div>
          <p className="text-xs text-muted-foreground">¡Copia este texto y envíalo!</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>Cerrar</Button>
            <Button onClick={() => { navigator.clipboard.writeText('Plantilla copiada'); setEmailDialogOpen(false); }}>
              Copiar plantilla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      }

      {/* Delete dialog */}
      {
        /*
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>¿Eliminar proveedor?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Esta acción no se puede deshacer.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => { setSuppliers(prev => prev.filter(s => s.id !== deleteId)); setDeleteId(null); }}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      */
      }
    </div>
  );
}
