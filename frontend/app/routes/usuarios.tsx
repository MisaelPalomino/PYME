import { useState, useEffect } from 'react';
import { Plus, Edit2, UserCheck, UserX, Shield } from 'lucide-react';
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
import type { Route } from './+types/usuarios';
import * as usuariosAPI from '~/api/usuario';
import { UsuarioSchema } from '~/api/usuario';
import type { Role, User } from '~/api/usuario';
import { toast } from 'sonner';

const roles: Role[] = ['Administrador', 'Gerente', 'Almacenero', 'Comprador'];

const roleConfig: Record<Role, { color: string; badge: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  Administrador: { color: 'text-purple-600', badge: 'default' },
  Gerente: { color: 'text-blue-600', badge: 'secondary' },
  Almacenero: { color: 'text-green-600', badge: 'outline' },
  Comprador: { color: 'text-orange-600', badge: 'outline' },
};

const rolePermissions: Record<Role, string[]> = {
  Administrador: ['Dashboard', 'Productos', 'Categorías', 'Movimientos', 'Inventario', 'Predicciones IA', 'Alertas', 'Pedidos', 'Reportes', 'Proveedores', 'Usuarios', 'Configuración'],
  Gerente: ['Dashboard', 'Inventario', 'Predicciones IA', 'Alertas', 'Pedidos', 'Reportes', 'Proveedores'],
  Almacenero: ['Dashboard', 'Productos', 'Movimientos', 'Inventario', 'Alertas'],
  Comprador: ['Dashboard', 'Inventario', 'Alertas', 'Pedidos', 'Proveedores'],
};

export async function loader() {
  const res = await usuariosAPI.get_all();
  if (!res.ok) throw new Error(res.error);
  return { usuarios: res.data };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = Object.fromEntries(formData);
  const intent = submission.intent;

  if (intent === 'delete') {
    const id = Number(submission.id_usuario);
    const res = await usuariosAPI.delete_usuario(id);
    return res.ok ? { success: true } : { error: res.error };
  }

  if (intent === 'activate') {
    const id = Number(submission.id_usuario);
    const getRes = await usuariosAPI.get_one(id);
    if (!getRes.ok) return { error: getRes.error };
    const currentUser = getRes.data;

    const res = await usuariosAPI.update(id, {
      username: currentUser.username,
      nombre: currentUser.nombre,
      email: currentUser.email,
      rol: currentUser.rol,
      activo: true
    });
    return res.ok ? { success: true } : { error: res.error };
  }

  const isEdit = intent === 'edit';

  const result = UsuarioSchema.safeParse(submission);
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const { name, email, role, active } = result.data;

  const payload = {
    username: email.split('@')[0],
    nombre: name,
    email: email,
    rol: role,
    ...(isEdit ? { activo: active } : { password: 'PymePass123!', password2: 'PymePass123!' })
  };

  const res = isEdit
    ? await usuariosAPI.update(Number(submission.editId), payload)
    : await usuariosAPI.create(payload);

  return res.ok ? { success: true } : { error: res.error };
}

export default function Users({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [permDialogOpen, setPermDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>('Almacenero');
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'Almacenero' as Role, active: true });

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return;
    if (fetcher.data.success) {
      setDialogOpen(false);
      toast.success('¡Operación realizada correctamente!');
    } else if (fetcher.data.error) {
      toast.error(fetcher.data.error);
    }
  }, [fetcher.state, fetcher.data]);

  const usersList = loaderData.usuarios;

  function openCreate() {
    setEditing(null);
    setForm({ name: '', email: '', role: 'Almacenero', active: true });
    setDialogOpen(true);
  }

  function openEdit(u: User) {
    setEditing(u);
    setForm({ name: u.name, email: u.email, role: u.role, active: u.active });
    setDialogOpen(true);
  }

  function handleSave() {
    fetcher.submit(
      {
        intent: editing ? 'edit' : 'create',
        editId: editing?.id || '',
        name: form.name,
        email: form.email,
        role: form.role,
        active: form.active.toString()
      },
      { method: 'post' }
    );
  }

  function toggleActive(id: string) {
    const user = loaderData.usuarios.find(u => u.id === id);
    if (!user) return;

    fetcher.submit(
      { 
        intent: user.active ? 'delete' : 'activate', 
        id_usuario: id 
      },
      { method: 'post' }
    );
  }

  const errors = (fetcher.data as { errors?: Record<string, string[]> })?.errors;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Usuarios y Roles
          </h1>
          <p className="text-sm text-muted-foreground font-medium">Control de acceso basado en roles (RBAC)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPermDialogOpen(true)} className="bg-background text-foreground">
            Ver Permisos por Rol
          </Button>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="text-left px-4 py-3 text-muted-foreground">Usuario</th>
                  <th className="text-left px-4 py-3 text-muted-foreground">Rol</th>
                  <th className="text-center px-4 py-3 text-muted-foreground">Estado</th>
                  <th className="text-left px-4 py-3 text-muted-foreground">Último acceso</th>
                  <th className="text-left px-4 py-3 text-muted-foreground">Creado</th>
                  <th className="text-center px-4 py-3 text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(u => {
                  const cfg = roleConfig[u.role] || { color: 'text-foreground', badge: 'outline' };
                  return (
                    <tr key={u.id} className={`border-b border-border/50 hover:bg-accent/30 transition-colors ${!u.active ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs text-foreground font-semibold shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-foreground font-medium">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={cfg.badge} className="text-xs">{u.role}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={u.active ? 'outline' : 'secondary'} className={`text-xs ${u.active ? 'text-green-600' : ''}`}>
                          {u.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {format(u.lastLogin, 'dd/MM/yyyy HH:mm', { locale: es })}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {format(u.createdAt, 'dd/MM/yyyy', { locale: es })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openEdit(u)} className="p-1.5 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground" title="Editar">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => toggleActive(u.id)} className={`p-1.5 rounded transition-colors text-muted-foreground ${u.active ? 'hover:bg-destructive/10 hover:text-destructive' : 'hover:bg-green-50 hover:text-green-600'}`} title={u.active ? 'Desactivar' : 'Activar'}>
                            {u.active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm bg-background text-foreground border border-border">
          <DialogHeader><DialogTitle>{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Nombre completo</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nombre Apellido" className="bg-background text-foreground" />
              {errors?.name && <p className="text-destructive text-xs">{errors.name[0]}</p>}
            </div>
            <div className="space-y-1">
              <Label>Correo electrónico</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="correo@empresa.com" className="bg-background text-foreground" />
              {errors?.email && <p className="text-destructive text-xs">{errors.email[0]}</p>}
            </div>
            <div className="space-y-1">
              <Label>Rol</Label>
              <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v as Role }))}>
                <SelectTrigger className="bg-background text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors?.role && <p className="text-destructive text-xs">{errors.role[0]}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.name || !form.email}>{editing ? 'Guardar' : 'Crear'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={permDialogOpen} onOpenChange={setPermDialogOpen}>
        <DialogContent className="max-w-lg bg-background text-foreground border border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Permisos por Rol (RBAC)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {roles.map(r => (
                <button
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${selectedRole === r ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-semibold">Módulos accesibles para {selectedRole}:</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Dashboard', 'Productos', 'Categorías', 'Movimientos', 'Inventario',
                  'Predicciones IA', 'Alertas', 'Pedidos', 'Reportes', 'Proveedores', 'Usuarios', 'Configuración'
                ].map(module => {
                  const hasAccess = rolePermissions[selectedRole].includes(module);
                  return (
                    <div key={module} className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium ${hasAccess ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-muted/30 text-muted-foreground'}`}>
                      <div className={`w-2 h-2 rounded-full ${hasAccess ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                      {module}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
