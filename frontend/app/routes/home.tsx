import type { Route } from "./+types/home";
import { es } from "date-fns/locale";
import * as api from "~/api/dashboard";
import { format } from "date-fns";
import { Button } from "~/components/ui/button";
import { AlertCircle, Boxes, CircleX, Clock, Download, Package, RefreshCw, ShoppingCart, TrendingUp, Truck } from "lucide-react";
import { to_money } from "~/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "~/components/ui/badge";
import { Link, useNavigate } from "react-router";

export async function clientLoader() {
  const response = await api.dashboard();
  if (!response.ok) {
    // TODO: Ni idea que hacer con el error
    throw response.error;
  }

  return response.data;
}

function buildKpis(resumen: api.Response["resumen"]) {
  return [
    {
      label: "Ventas del mes",
      value: to_money(resumen.ventas_mes.monto),
      sub: `${resumen.ventas_mes.unidades} unidades`,
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      label: "Ventas de la semana",
      value: to_money(resumen.ventas_semana.monto),
      sub: `${resumen.ventas_semana.unidades} unidades`,
      icon: ShoppingCart,
      color: "text-blue-500",
    },
    {
      label: "Pedidos pendientes",
      value: resumen.pedidos_pendientes,
      sub: "En espera de procesamiento",
      icon: Clock,
      color: "text-yellow-500",
    },
    {
      label: "En tránsito",
      value: resumen.pedidos_en_transito,
      sub: "Pedidos en camino",
      icon: Truck,
      color: "text-indigo-500",
    },
    {
      label: "Productos totales",
      value: resumen.total_productos,
      sub: "Inventario general",
      icon: Boxes,
      color: "text-purple-500",
    },
    {
      label: "Bajo stock",
      value: resumen.productos_bajo_stock,
      sub: "Requiere reposición",
      icon: AlertCircle,
      color: "text-orange-500",
    },
    {
      label: "Sin stock",
      value: resumen.productos_sin_stock,
      sub: "Agotados",
      icon: CircleX,
      color: "text-red-500",
    },
  ];
}

export default function Home({ loaderData }: Route.ComponentProps) {
  // const navigate = useNavigate();
  const kpis = buildKpis(loaderData.resumen);
  const chartData = loaderData.ventas_diarias.map((v) => ({
    dia: new Date(v.dia).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
    }),
    ventas: v.monto,
    unidades: v.unidades,
  }));

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {format(loaderData.generado_en, "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm:ss", { locale: es })} — Visión global del inventario
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 p-1">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;

            return (
              <Card
                key={kpi.label}
                className="min-w-[220px] flex-shrink-0"
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {kpi.label}
                      </p>
                      <p className="text-2xl text-foreground">
                        {kpi.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {kpi.sub}
                      </p>
                    </div>

                    <div className="p-2 rounded-lg bg-accent">
                      <Icon className={`w-5 h-5 ${kpi.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        { /* Alerts panel */}
        <div className="xl:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground">{loaderData.resumen.alertas_totales} Alertas Activas</h2>
          </div>
          <ScrollArea className="h-[500px] pr-3">
            <div className="space-y-3">
              {loaderData.alertas_activas.map((alert) => {
                let cfg: any = { bg: 'bg-blue-50 dark:bg-blue-900/10', border: 'border-blue-300 dark:border-blue-700', badge: 'secondary' as const, dot: 'bg-blue-500' };
                switch (alert.tipo_alerta) {
                  case "sin_stock":
                    cfg = { bg: 'bg-destructive/10', border: 'border-destructive/30', badge: 'destructive' as const, dot: 'bg-destructive' };
                  break;
                  case "stock_bajo":
                    cfg = { bg: 'bg-yellow-50 dark:bg-yellow-900/10', border: 'border-yellow-300 dark:border-yellow-700', badge: 'secondary' as const, dot: 'bg-yellow-500' };
                    break;
                }
                // const cfg = severityConfig[alert.tipo_alerta] ?? severityConfig.default;
                /*
                 
                */

                return (
                  <div
                    key={alert.id_alerta}
                    className={`p-3 rounded-xl border ${cfg.bg} ${cfg.border} cursor-pointer hover:opacity-80 transition-opacity`}
                  >
                    <div className="flex items-start gap-2">
                      <div
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${cfg.dot}`}
                      />

                      <div className="flex-1 min-w-0">
                        {/* Producto */}
                        <p className="text-xs text-foreground leading-snug font-medium">
                          {alert.producto_nombre}
                        </p>

                        {/* Mensaje */}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {alert.mensaje}
                        </p>

                        {/* Stock info */}
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-[11px] text-muted-foreground">
                            Stock: <span className="text-foreground">{alert.stock_actual}</span>
                          </p>

                          <p className="text-[11px] text-muted-foreground">
                            Min: <span className="text-foreground">{alert.stock_minimo}</span>
                          </p>
                        </div>
                      </div>
                      <Badge variant={cfg.badge} className="text-xs shrink-0">
                        {alert.tipo_alerta === "sin_stock"
                          ? "Crítico"
                          : alert.tipo_alerta === "stock_bajo"
                            ? "Aviso"
                            : "Info"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          { /* AI Predictions summary */}
          {/*
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Predicciones IA — Próximos 7 días</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {criticalPredictions.slice(0, 3).map(p => (
                <div key={p.productId} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs text-foreground truncate">{p.productName}</p>
                    <p className="text-xs text-muted-foreground">Demanda 7d: {p.demand7} uds</p>
                  </div>
                  <Badge variant="destructive" className="text-xs shrink-0 ml-2">
                    {p.daysUntilStockout === 0 ? 'Agotado' : `${p.daysUntilStockout}d`}
                  </Badge>
                </div>
              ))}
              {warningPredictions.slice(0, 2).map(p => (
                <div key={p.productId} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs text-foreground truncate">{p.productName}</p>
                    <p className="text-xs text-muted-foreground">Demanda 7d: {p.demand7} uds</p>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0 ml-2">
                    {p.daysUntilStockout}d
                  </Badge>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full mt-1" onClick={() => navigate('/predictions')}>
                Ver predicciones completas <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </CardContent>
          </Card>
          */}
        </div>

        { /* Sales chart */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground">Gráfico de Ventas</h2>
          </div>

          <Card>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                    </linearGradient>

                    <linearGradient id="colorUnidades" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                  />

                  <XAxis
                    dataKey="dia"
                    tick={{ fontSize: 12 }}
                    stroke="var(--color-muted-foreground)"
                  />

                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="var(--color-muted-foreground)"
                    tickFormatter={(v) => `S/ ${(v / 1000).toFixed(0)}k`}
                    label={{
                      value: "Ventas (S/)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />

                  <Tooltip
                    formatter={(value, name) => {
                      if (name == "Ventas") {
                        value = to_money(value as number);
                      }

                      return [`${value}`, name];
                    }}
                  />

                  <Legend />

                  <Area
                    type="monotone"
                    dataKey="ventas"
                    name="Ventas"
                    stroke="var(--color-chart-2)"
                    fill="url(#colorVentas)"
                    strokeWidth={2}
                  />

                  <Area
                    type="monotone"
                    dataKey="unidades"
                    name="Unidades"
                    stroke="var(--color-chart-1)"
                    fill="url(#colorUnidades)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Package className="w-4 h-4" />
                    Productos con Stock Crítico
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {loaderData.stock_critico.length} productos
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/inventario?tipo=Crítico">
                    Ver inventario
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 text-muted-foreground">Producto</th>
                      <th className="text-left py-2 pr-4 text-muted-foreground">SKU</th>
                      <th className="text-center py-2 pr-4 text-muted-foreground">Stock</th>
                      <th className="text-center py-2 pr-4 text-muted-foreground">Mínimo</th>
                      <th className="text-center py-2 text-muted-foreground">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loaderData.stock_critico.slice(0, 5).map(p => (
                      <tr key={p.id_producto} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                        <td className="py-2 pr-4 text-foreground truncate max-w-[140px]">{p.nombre}</td>
                        <td className="py-2 pr-4 text-muted-foreground font-mono">{p.sku}</td>
                        <td className="py-2 pr-4 text-center">
                          <span className={p.stock_actual === 0 ? 'text-destructive' : 'text-yellow-600'}>{p.stock_actual}</span>
                        </td>
                        <td className="py-2 pr-4 text-center text-muted-foreground">{p.stock_minimo}</td>
                        <td className="py-2 text-center">
                          <Badge variant={p.stock_actual === 0 ? 'destructive' : 'secondary'} className="text-xs">
                            {p.stock_actual === 0 ? 'Agotado' : 'Crítico'}
                          </Badge>
                        </td>
                      </tr>
                    ))}

                    {/* ROW INDICATIVO */}
                    {loaderData.stock_critico.length > 5 && (
                      <tr className="text-center">
                        <td colSpan={5} className="py-3 text-xs text-muted-foreground italic">
                          ... mostrando 5 de {loaderData.stock_critico.length} productos
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
