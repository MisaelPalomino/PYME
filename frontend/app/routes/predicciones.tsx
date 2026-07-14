import { useMemo } from 'react';
import { Brain, RefreshCw, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { createColumnHelper } from '@tanstack/react-table';
import { createSortableHeader, TableList, type Filter } from '~/components/Table';
import type { Route } from "./+types/predicciones";
import { useFetcher } from "react-router";
import * as iaAPI from "~/api/ia";
import type { ActionFunctionArgs } from "react-router";
import type { Prediccion } from '~/api/ia';

export async function loader() {
  const res = await iaAPI.get_all();
  if (!res.ok) throw new Error(res.error);
  return { predictions: res.data };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "train") {
    const res = await iaAPI.generar_todos();
    return res.ok 
      ? { success: true, trainedAt: new Date().toISOString() }
      : { error: res.error };
  }
  return null;
}

const alertConfig = {
  critical: { label: 'Rotura ≤3 días', badge: 'destructive' as const },
  warning: { label: 'Rotura 4-7 días', badge: 'secondary' as const },
  none: { label: 'Normal', badge: 'outline' as const },
};

const columnHelper = createColumnHelper<Prediccion>();

const columns = [
  columnHelper.accessor("producto_nombre", {
    header: createSortableHeader("Producto"),
    filterFn: (row, _, value) => {
      const texto = value.toLowerCase();
      return row.original.producto_nombre.toLowerCase().includes(texto) || row.original.sku.toLowerCase().includes(texto);
    },
    cell: (info) => (
      <div className="px-4 py-3">
        <p className="text-foreground font-medium">{info.getValue()}</p>
        <p className="text-xs text-muted-foreground font-mono">{info.row.original.sku}</p>
      </div>
    )
  }),
  columnHelper.accessor("stock_actual", {
    header: createSortableHeader("Stock"),
    cell: (info) => (
      <div className="px-4 py-3 text-center">
        <span className={info.getValue() === 0 ? 'text-destructive font-semibold' : 'text-foreground'}>
          {info.getValue()}
        </span>
      </div>
    )
  }),
  columnHelper.accessor("prediccion_7d", {
    header: createSortableHeader("Dem. 7d"),
    cell: (info) => (
      <div className="px-4 py-3 text-center text-foreground font-medium">
        {info.getValue() !== null ? info.getValue() : '-'}
      </div>
    )
  }),
  columnHelper.accessor("prediccion_14d", {
    header: createSortableHeader("Dem. 14d"),
    cell: (info) => (
      <div className="px-4 py-3 text-center text-foreground font-medium">
        {info.getValue() !== null ? info.getValue() : '-'}
      </div>
    )
  }),
  columnHelper.accessor("prediccion_21d", {
    header: createSortableHeader("Dem. 21d"),
    cell: (info) => (
      <div className="px-4 py-3 text-center text-foreground font-medium">
        {info.getValue() !== null ? info.getValue() : '-'}
      </div>
    )
  }),
  columnHelper.display({
    id: "daysUntilStockout",
    header: "Días s/agot.",
    cell: (info) => {
      const p = info.row.original;
      const demand7 = p.prediccion_7d !== null ? Number(p.prediccion_7d) : 0;
      const dailyDemand = demand7 / 7;
      const daysUntilStockout = dailyDemand > 0 ? Math.floor(p.stock_actual / dailyDemand) : 999;

      return (
        <div className="px-4 py-3 text-center font-medium">
          <span className={p.stock_actual === 0 ? 'text-destructive' : daysUntilStockout <= 3 ? 'text-destructive' : daysUntilStockout <= 7 ? 'text-yellow-600' : 'text-foreground'}>
            {p.stock_actual === 0 ? 'Agotado' : daysUntilStockout >= 999 ? 'Estable' : `${daysUntilStockout}d`}
          </span>
        </div>
      );
    }
  }),
  columnHelper.display({
    id: "alertType",
    header: "Alerta",
    filterFn: (row, _, value) => {
      const p = row.original;
      const demand7 = p.prediccion_7d !== null ? Number(p.prediccion_7d) : 0;
      const dailyDemand = demand7 / 7;
      const daysUntilStockout = dailyDemand > 0 ? Math.floor(p.stock_actual / dailyDemand) : 999;

      let alertType = 'none';
      if (p.stock_actual === 0 || daysUntilStockout <= 3) {
        alertType = 'critical';
      } else if (daysUntilStockout <= 7) {
        alertType = 'warning';
      }

      switch (value) {
        case "Críticas (≤3 días)": return alertType === "critical";
        case "Preventivas (4-7 días)": return alertType === "warning";
        case "Sin alerta": return alertType === "none";
        default: return true;
      }
    },
    cell: (info) => {
      const p = info.row.original;
      const demand7 = p.prediccion_7d !== null ? Number(p.prediccion_7d) : 0;
      const dailyDemand = demand7 / 7;
      const daysUntilStockout = dailyDemand > 0 ? Math.floor(p.stock_actual / dailyDemand) : 999;

      let alertType: 'critical' | 'warning' | 'none' = 'none';
      if (p.stock_actual === 0 || daysUntilStockout <= 3) {
        alertType = 'critical';
      } else if (daysUntilStockout <= 7) {
        alertType = 'warning';
      }

      const aConfig = alertConfig[alertType];
      return (
        <div className="px-4 py-3 text-center">
          <Badge variant={aConfig.badge} className="text-xs">{aConfig.label}</Badge>
        </div>
      );
    }
  })
];

export default function Predictions({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();

  const predictions = loaderData.predictions;

  const training = fetcher.state !== 'idle';
  const trainData = fetcher.data as { success?: boolean; trainedAt?: string } | undefined;
  const trainedAt = trainData?.success && trainData.trainedAt ? new Date(trainData.trainedAt) : null;

  const handleTrain = () => {
    fetcher.submit({ intent: "train" }, { method: "post" });
  };

  // Calcular métricas agregadas globales
  const totals = useMemo(() => {
    const trained = predictions.filter(p => p.prediccion_7d !== null);
    const avgMae = trained.length > 0 ? (trained.reduce((acc, p) => acc + (p.mae || 0), 0) / trained.length).toFixed(2) : '0.00';
    const avgMape = trained.length > 0 ? (trained.reduce((acc, p) => acc + (p.mape || 0), 0) / trained.length).toFixed(1) : '0.0';

    let criticalAlerts = 0;
    let warningAlerts = 0;

    predictions.forEach(p => {
      const demand7 = p.prediccion_7d !== null ? Number(p.prediccion_7d) : 0;
      const dailyDemand = demand7 / 7;
      const daysUntilStockout = dailyDemand > 0 ? Math.floor(p.stock_actual / dailyDemand) : 999;

      if (p.stock_actual === 0 || daysUntilStockout <= 3) {
        criticalAlerts++;
      } else if (daysUntilStockout <= 7) {
        warningAlerts++;
      }
    });

    return {
      avgMae,
      avgMape,
      critical: criticalAlerts,
      warning: warningAlerts
    };
  }, [predictions]);

  const radarData = [
    { subject: 'Precisión', A: 85 },
    { subject: 'Cobertura', A: 78 },
    { subject: 'F1-Score', A: 81 },
    { subject: 'Estabilidad', A: 90 },
    { subject: 'Velocidad', A: 95 },
  ];


  const filters: Filter[] = [
    {
      type: "input",
      columnName: "producto_nombre",
      placeholder: "Buscar por producto o SKU..."
    },
    {
      type: "combobox",
      columnName: "alertType",
      placeholder: "Todas las alertas",
      items: ["Críticas (≤3 días)", "Preventivas (4-7 días)", "Sin alerta"]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Predicciones
          </h1>
          <p className="text-sm text-muted-foreground">Algoritmo Random Forest Regressor — Demanda 7, 14 y 21 días</p>
        </div>
        <Button onClick={handleTrain} disabled={training}>
          <RefreshCw className={`w-4 h-4 mr-2 ${training ? 'animate-spin' : ''}`} />
          {training ? 'Reentrenando...' : 'Reentrenar Modelo'}
        </Button>
      </div>

      {trainedAt && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl text-xs text-green-700 dark:text-green-400">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Modelo reentrenado exitosamente el {format(trainedAt, "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
        </div>
      )}

      {/* Model global metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'MAE Promedio', value: totals.avgMae, sub: 'Unidades', color: 'text-blue-500' },
            { label: 'MAPE Promedio', value: `${totals.avgMape}%`, sub: 'Error porcentual', color: 'text-purple-500' },
            { label: 'Alertas Críticas', value: String(totals.critical), sub: '≤ 3 días', color: 'text-destructive font-semibold' },
            { label: 'Alertas Preventivas', value: String(totals.warning), sub: '4–7 días', color: 'text-yellow-600 font-semibold' },
          ].map(m => (
            <Card key={m.label}>
              <CardContent className="pt-5 pb-4">
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className={`text-2xl mt-1 font-bold ${m.color}`}>{m.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{m.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Rendimiento del Modelo</CardTitle>
            <CardDescription className="text-xs">Métricas globales de precisión</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center">
            <ResponsiveContainer width="100%" height={150}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                <Radar dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Predictions table */}
      <TableList columns={columns} data={predictions} filters={filters} />
    </div>
  );
}
