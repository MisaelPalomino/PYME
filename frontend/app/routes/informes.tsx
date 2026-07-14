import { useState, useMemo } from 'react';
import { BarChart3, Download, FileText, TrendingUp, Package, Brain, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSearchParams } from 'react-router';
import type { Route } from './+types/informes';
import * as categoriasAPI from '~/api/categoria';
import * as informesAPI from '~/api/informe';
import { toast } from 'sonner';

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const categoria = url.searchParams.get('categoria') || 'all';
  const periodo = url.searchParams.get('periodo') || 'month';

  const apiParams: Record<string, string | number | boolean | undefined> = {};
  if (categoria !== 'all') {
    apiParams.categoria = Number(categoria);
  }
  apiParams.periodo = periodo;

  const [
    categoriasRes,
    bajoStockRes,
    rotacionRes,
    consolidadoRes,
    graficosCVRes
  ] = await Promise.all([
    categoriasAPI.get_all(),
    informesAPI.get_bajo_stock(apiParams),
    informesAPI.get_rotacion(apiParams),
    informesAPI.get_consolidado(),
    informesAPI.get_graficos_compras_ventas(apiParams)
  ]);

  if (!categoriasRes.ok) throw new Error(categoriasRes.error);
  if (!bajoStockRes.ok) throw new Error(bajoStockRes.error);
  if (!rotacionRes.ok) throw new Error(rotacionRes.error);
  if (!consolidadoRes.ok) throw new Error(consolidadoRes.error);
  if (!graficosCVRes.ok) throw new Error(graficosCVRes.error);

  return {
    categorias: categoriasRes.data,
    bajoStock: bajoStockRes.data,
    rotacion: rotacionRes.data,
    consolidado: consolidadoRes.data,
    graficosCV: graficosCVRes.data,
    categoria,
    periodo
  };
}

export default function Reports({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('categoria') || 'all';
  const periodFilter = searchParams.get('periodo') || 'month';
  const [activeTab, setActiveTab] = useState('low_stock');

  const handleCategoryChange = (val: string) => {
    setSearchParams(prev => {
      prev.set('categoria', val);
      return prev;
    });
  };

  const handlePeriodChange = (val: string) => {
    setSearchParams(prev => {
      prev.set('periodo', val);
      return prev;
    });
  };

  function handleExport(type: 'pdf' | 'excel', reportName: string) {
    toast.info(`Exportando "${reportName}" como ${type.toUpperCase()}...`, {
      description: 'Generando archivo en el cliente. En producción esto llamará a los servicios de descarga.',
    });
  }

  // Mapear datos de rotación para Recharts
  const rotationData = useMemo(() => {
    return loaderData.rotacion.slice(0, 8).map(r => ({
      name: r.nombre.split(' ').slice(0, 2).join(' '),
      ventas30d: r.ventas_periodo,
      stockPromedio: r.stock_promedio,
      rotacion: r.indice_rotacion ? parseFloat(Number(r.indice_rotacion).toFixed(2)) : 0,
    }));
  }, [loaderData.rotacion]);

  // Mapear últimas semanas para reporte consolidado
  const last4WeeksData = useMemo(() => {
    return loaderData.consolidado.ultimas_semanas.map((s, idx) => {
      const date = new Date(s.periodo);
      const label = `S${idx + 1} (${format(date, 'dd/MM', { locale: es })})`;
      return {
        week: label,
        ventas: Number(s.ventas),
        compras: Number(s.compras)
      };
    });
  }, [loaderData.consolidado.ultimas_semanas]);

  // Mapear gráfico de ventas y compras mensual
  const monthlySalesData = useMemo(() => {
    return loaderData.graficosCV.map(g => {
      const date = new Date(g.periodo);
      const label = periodFilter === 'week'
        ? format(date, 'EEEE', { locale: es })
        : periodFilter === 'month'
        ? format(date, 'dd/MM', { locale: es })
        : format(date, 'MMM yy', { locale: es });
      return {
        name: label,
        ventas: Number(g.ventas),
        compras: Number(g.compras)
      };
    });
  }, [loaderData.graficosCV, periodFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Informes y Reportes
          </h1>
          <p className="text-sm text-muted-foreground font-medium">Exporta en PDF o Excel e integra estadísticas reales del inventario</p>
        </div>
        <div className="flex gap-2">
          <Select value={periodFilter} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-36 bg-background text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mes</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Año</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-48 bg-background text-foreground">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {loaderData.categorias.map(c => (
                <SelectItem key={c.id_categoria} value={c.id_categoria.toString()}>
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap h-auto gap-1 bg-muted p-1 rounded-lg">
        {[
          { id: 'low_stock', label: 'Bajo Stock' },
          { id: 'rotation', label: 'Rotación' },
          { id: 'consolidated', label: 'Consolidado' },
          { id: 'charts', label: 'Gráticos Compras/Ventas' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all
              ${activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bajo Stock report */}
      {activeTab === 'low_stock' && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Package className="w-4 h-4 text-primary" />
                    Reporte de Bajo Stock
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {loaderData.bajoStock.length} productos en o por debajo del stock mínimo
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleExport('excel', 'Bajo Stock')}>
                    <Download className="w-3.5 h-3.5 mr-1" /> Excel
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleExport('pdf', 'Bajo Stock')}>
                    <FileText className="w-3.5 h-3.5 mr-1" /> PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/30">
                    <tr>
                      <th className="text-left px-4 py-3 text-muted-foreground">Producto</th>
                      <th className="text-left px-4 py-3 text-muted-foreground">Categoría</th>
                      <th className="text-center px-4 py-3 text-muted-foreground">Stock Actual</th>
                      <th className="text-center px-4 py-3 text-muted-foreground">Stock Mínimo</th>
                      <th className="text-center px-4 py-3 text-muted-foreground">Déficit</th>
                      <th className="text-center px-4 py-3 text-muted-foreground">Lead Time</th>
                      <th className="text-center px-4 py-3 text-muted-foreground">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loaderData.bajoStock.map(p => (
                      <tr key={p.id_producto} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-foreground font-medium">{p.nombre}</p>
                          <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{p.categoria}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={p.stock_actual === 0 ? 'text-destructive font-bold' : 'text-yellow-600 font-semibold'}>{p.stock_actual}</span>
                        </td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{p.stock_minimo}</td>
                        <td className="px-4 py-3 text-center text-destructive font-semibold">{p.deficit}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{p.lead_time_dias}d</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={p.estado === 'Agotado' ? 'destructive' : 'secondary'}>
                            {p.estado === 'Agotado' ? 'Agotado' : 'Crítico'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {loaderData.bajoStock.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                          No hay productos con stock crítico o bajo en esta categoría
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rotation report */}
      {activeTab === 'rotation' && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Rotación de Inventario — Período Seleccionado
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">Ventas vs. stock promedio del período</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleExport('excel', 'Rotación')}>
                    <Download className="w-3.5 h-3.5 mr-1" /> Excel
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleExport('pdf', 'Rotación')}>
                    <FileText className="w-3.5 h-3.5 mr-1" /> PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {rotationData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={rotationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="ventas30d" name="Ventas" fill="var(--color-chart-1)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="stockPromedio" name="Stock Promedio" fill="var(--color-chart-2)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-60 flex items-center justify-center border border-dashed rounded-lg text-muted-foreground text-sm">
                  Sin datos suficientes para graficar rotación
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/20">
                    <tr>
                      <th className="text-left py-2 px-4 text-muted-foreground">Producto</th>
                      <th className="text-center py-2 px-4 text-muted-foreground">Ventas en Período</th>
                      <th className="text-center py-2 px-4 text-muted-foreground">Stock Promedio</th>
                      <th className="text-center py-2 px-4 text-muted-foreground">Índice Rotación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rotationData.map((r, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                        <td className="py-2 px-4 text-foreground font-medium">{r.name}</td>
                        <td className="py-2 px-4 text-center text-foreground font-semibold">{r.ventas30d}</td>
                        <td className="py-2 px-4 text-center text-muted-foreground">{r.stockPromedio}</td>
                        <td className="py-2 px-4 text-center">
                          <Badge variant={r.rotacion > 2 ? 'outline' : 'secondary'} className="text-xs">
                            {r.rotacion.toFixed(2)}x
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {rotationData.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-muted-foreground">
                          No se encontraron datos de rotación
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Consolidated report */}
      {activeTab === 'consolidated' && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Brain className="w-4 h-4 text-primary" />
                    Reporte Consolidado
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">Bajo stock + rotación + métricas IA + últimas semanas</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleExport('excel', 'Consolidado')}>
                    <Download className="w-3.5 h-3.5 mr-1" /> Excel
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleExport('pdf', 'Consolidado')}>
                    <FileText className="w-3.5 h-3.5 mr-1" /> PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Productos bajo stock', value: loaderData.consolidado.resumen.productos_bajo_stock, color: 'text-destructive' },
                  { label: 'Alertas críticas IA', value: loaderData.consolidado.resumen.alertas_criticas_ia, color: 'text-destructive' },
                  { label: 'MAE promedio', value: loaderData.consolidado.resumen.mae_promedio ? `${Number(loaderData.consolidado.resumen.mae_promedio).toFixed(2)} uds` : '0.00 uds', color: 'text-blue-500' },
                  { label: 'MAPE promedio', value: loaderData.consolidado.resumen.mape_promedio ? `${Number(loaderData.consolidado.resumen.mape_promedio).toFixed(1)}%` : '0.0%', color: 'text-blue-500' },
                ].map(m => (
                  <div key={m.label} className="p-3 bg-muted/40 rounded-lg">
                    <p className="text-xs text-muted-foreground font-medium">{m.label}</p>
                    <p className={`text-xl font-bold mt-1 ${m.color}`}>{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Last weeks chart */}
              <div>
                <p className="text-sm text-foreground mb-3 flex items-center gap-2 font-medium">
                  <Calendar className="w-4 h-4 text-primary" />
                  Últimas semanas — Compras y Ventas del Sistema
                </p>
                {last4WeeksData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={last4WeeksData}>
                      <defs>
                        <linearGradient id="gVentas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gCompras" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                      <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickFormatter={v => `S/${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: unknown) => [`S/ ${Number(v || 0).toLocaleString()}`, '']} />
                      <Legend />
                      <Area type="monotone" dataKey="ventas" name="Ventas" stroke="var(--color-chart-1)" fill="url(#gVentas)" strokeWidth={2} />
                      <Area type="monotone" dataKey="compras" name="Compras" stroke="var(--color-chart-2)" fill="url(#gCompras)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-44 flex items-center justify-center border border-dashed rounded-lg text-muted-foreground text-sm">
                    Sin datos históricos suficientes
                  </div>
                )}
              </div>

              {/* AI metrics per product */}
              <div>
                <p className="text-sm text-foreground mb-3 font-semibold">Métricas de Precisión IA por Producto</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="border-b border-border bg-muted/20">
                      <tr>
                        <th className="text-left py-2 px-4 text-muted-foreground">Producto</th>
                        <th className="text-center py-2 px-4 text-muted-foreground">MAE</th>
                        <th className="text-center py-2 px-4 text-muted-foreground">MAPE</th>
                        <th className="text-center py-2 px-4 text-muted-foreground">Estado Modelo</th>
                        <th className="text-center py-2 px-4 text-muted-foreground">Alerta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loaderData.consolidado.metricas_por_producto.map(p => (
                        <tr key={p.id_producto} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                          <td className="py-2 px-4 text-foreground font-medium">{p.nombre}</td>
                          <td className="py-2 px-4 text-center text-muted-foreground font-mono">{p.mae ? Number(p.mae).toFixed(2) : '—'}</td>
                          <td className="py-2 px-4 text-center text-muted-foreground font-mono">{p.mape ? `${Number(p.mape).toFixed(1)}%` : '—'}</td>
                          <td className="py-2 px-4 text-center">
                            <Badge variant="outline" className="text-[10px]">
                              {p.estado_modelo || 'Sin datos'}
                            </Badge>
                          </td>
                          <td className="py-2 px-4 text-center">
                            <Badge variant={p.alerta === 'Critica' ? 'destructive' : p.alerta === 'Preventiva' ? 'secondary' : 'outline'} className="text-[10px]">
                              {p.alerta === 'Critica' ? 'Crítica' : p.alerta === 'Preventiva' ? 'Preventiva' : 'Normal'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                      {loaderData.consolidado.metricas_por_producto.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">
                            No se encontraron métricas IA
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sales/Purchase charts */}
      {activeTab === 'charts' && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-base">Gráfico de Compras y Ventas</CardTitle>
                  <CardDescription className="text-xs mt-1">Filtrado por categoría y período seleccionado</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleExport('excel', 'Ventas y Compras')}>
                    <Download className="w-3.5 h-3.5 mr-1" /> Excel
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleExport('pdf', 'Ventas y Compras')}>
                    <FileText className="w-3.5 h-3.5 mr-1" /> PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {monthlySalesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={monthlySalesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickFormatter={v => `S/${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: unknown) => [`S/ ${Number(v || 0).toLocaleString()}`, '']} />
                    <Legend />
                    <Bar dataKey="ventas" name="Ventas" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="compras" name="Compras" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-60 flex items-center justify-center border border-dashed rounded-lg text-muted-foreground text-sm">
                  Sin datos en el período e histórico seleccionado
                </div>
              )}
              <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                 * Para exportar el gráfico como imagen, haz clic derecho sobre el gráfico y selecciona &quot;Guardar imagen&quot;.
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
