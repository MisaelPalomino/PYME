import { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { Card, CardContent } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useFetcher } from 'react-router';
import { z } from 'zod';
import type { Route } from './+types/alertas';
import * as dashboardAPI from '~/api/dashboard';

export type SystemAlert = {
  id: string;
  title: string;
  description: string;
  type: 'low_stock' | 'stockout_prediction' | 'overdue_order' | 'sales';
  severity: 'critical' | 'warning' | 'info';
  timestamp: Date;
  read: boolean;
};

const typeLabels: Record<SystemAlert['type'], string> = {
  low_stock: 'Bajo Stock',
  stockout_prediction: 'Predicción Crítica',
  overdue_order: 'Pedido Vencido',
  sales: 'Ventas',
};

const severityConfig = {
  critical: { bg: 'bg-destructive/10', border: 'border-destructive/30', dot: 'bg-destructive', badge: 'destructive' as const, label: 'Crítico' },
  warning: { bg: 'bg-yellow-50 dark:bg-yellow-900/10', border: 'border-yellow-300 dark:border-yellow-700', dot: 'bg-yellow-500', badge: 'secondary' as const, label: 'Aviso' },
  info: { bg: 'bg-blue-50 dark:bg-blue-900/10', border: 'border-blue-300 dark:border-blue-700', dot: 'bg-blue-500', badge: 'secondary' as const, label: 'Info' },
};

export async function clientLoader() {
  const response = await dashboardAPI.dashboard();
  const alertsFromBackend = response.ok ? response.data.alertas_activas : [];

  const mappedBackendAlerts: SystemAlert[] = alertsFromBackend.map((al) => {
    const isCritical = al.tipo_alerta === 'sin_stock';
    return {
      id: al.id_alerta.toString(),
      title: al.producto_nombre,
      description: al.mensaje,
      type: isCritical ? ('stockout_prediction' as const) : ('low_stock' as const),
      severity: isCritical ? ('critical' as const) : ('warning' as const),
      timestamp: new Date(al.fecha_creacion),
      read: false,
    };
  });

  let readIds: string[] = [];
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('read_alerts');
    if (stored) {
      try {
        readIds = JSON.parse(stored) as string[];
      } catch (e) {
        console.error('Error parsing read_alerts from localStorage', e);
      }
    }
  }

  const allAlerts = mappedBackendAlerts.map((alert) => ({
    ...alert,
    read: readIds.includes(alert.id),
  }));

  allAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return { alerts: allAlerts };
}

const AlertasActionSchema = z.object({
  intent: z.enum(['markRead', 'markAllRead']),
  id: z.string().optional(),
});

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const submission = Object.fromEntries(formData);

  const result = AlertasActionSchema.safeParse(submission);
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('read_alerts');
    let readIds: string[] = stored ? JSON.parse(stored) : [];

    if (result.data.intent === 'markRead' && result.data.id) {
      if (!readIds.includes(result.data.id)) {
        readIds.push(result.data.id);
      }
    } else if (result.data.intent === 'markAllRead') {
      const allIdsStr = formData.get('allIds');
      if (typeof allIdsStr === 'string') {
        const ids = allIdsStr.split(',').filter(Boolean);
        ids.forEach((id) => {
          if (!readIds.includes(id)) {
            readIds.push(id);
          }
        });
      }
    }

    localStorage.setItem('read_alerts', JSON.stringify(readIds));
    window.dispatchEvent(new Event("alerts-updated"));
  }

  return { success: true };
}

export default function Alerts({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();
  const alerts = loaderData.alerts;

  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [readFilter, setReadFilter] = useState('all');

  const filtered = alerts.filter((a) => {
    const matchSev = severityFilter === 'all' || a.severity === severityFilter;
    const matchType = typeFilter === 'all' || a.type === typeFilter;
    const matchRead = readFilter === 'all' || (readFilter === 'unread' ? !a.read : a.read);
    return matchSev && matchType && matchRead;
  });

  function markRead(id: string) {
    fetcher.submit({ intent: 'markRead', id }, { method: 'post' });
  }

  function markAllRead() {
    const unreadIds = filtered.filter((a) => !a.read).map((a) => a.id);
    fetcher.submit({ intent: 'markAllRead', allIds: unreadIds.join(',') }, { method: 'post' });
  }

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-foreground flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Alertas
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-destructive text-destructive-foreground rounded-full text-xs">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">Notificaciones de stock, predicciones y pedidos</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={fetcher.state !== 'idle'}>
            <Check className="w-4 h-4 mr-2" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-40 bg-background border-border text-foreground">
            <SelectValue placeholder="Severidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="critical">Críticas</SelectItem>
            <SelectItem value="warning">Avisos</SelectItem>
            <SelectItem value="info">Información</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48 bg-background border-border text-foreground">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="low_stock">Bajo Stock</SelectItem>
            <SelectItem value="stockout_prediction">Predicción Rotura</SelectItem>
            <SelectItem value="overdue_order">Pedido Vencido</SelectItem>
            <SelectItem value="sales">Ventas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={readFilter} onValueChange={setReadFilter}>
          <SelectTrigger className="w-36 bg-background border-border text-foreground">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="unread">Sin leer</SelectItem>
            <SelectItem value="read">Leídas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alerts list */}
      <div className="space-y-3">
        {filtered.map((alert) => {
          const cfg = severityConfig[alert.severity] || severityConfig.info;
          return (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border ${cfg.bg} ${cfg.border} ${!alert.read ? 'shadow-sm' : 'opacity-70'} transition-opacity`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${cfg.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-sm text-foreground font-semibold">{alert.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {typeLabels[alert.type]}
                      </Badge>
                      <Badge variant={cfg.badge} className="text-xs">
                        {cfg.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground font-medium">
                      {format(alert.timestamp, "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                    </p>
                    {!alert.read && (
                      <button
                        onClick={() => markRead(alert.id)}
                        disabled={fetcher.state !== 'idle'}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 font-semibold"
                      >
                        <Check className="w-3 h-3" />
                        Marcar como leída
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No hay alertas que mostrar</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
