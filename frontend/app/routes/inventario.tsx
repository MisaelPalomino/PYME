import { useState } from 'react';
import { History } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { createColumnHelper } from '@tanstack/react-table';
import type { Producto } from '~/api/types';
import { createSortableHeader, TableList, type Filter } from '~/components/Table';
import type { Route } from "./+types/inventario";
import { productosAPI, categoriasAPI, movimientosAPI } from "~/api/api";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const defaultTipo = url.searchParams.get("tipo");

  const [
    { data: backendProductos },
    { data: categorias },
    { data: movimientos }
  ] = await Promise.all([
    productosAPI.getAll(),
    categoriasAPI.getAll(),
    movimientosAPI.getAll()
  ]);

  const filters: Filter[] = [
    {
      type: "input",
      columnName: "nombre",
      placeholder: "Buscar producto o SKU..."
    },
    {
      type: "combobox",
      columnName: "categoria_nombre",
      placeholder: "Todas las categorías",
      items: categorias.map(x => x.nombre)
    },
    {
      type: "combobox",
      columnName: "stock_actual",
      placeholder: "Todos los rangos",
      defaultValue: defaultTipo ?? undefined,
      items: ["Normal", "Advertencia", "Crítico"]
    }
  ];

  const productos = backendProductos.map(p => {
    let estado: "normal" | "warning" | "critical" = "normal";
    if (p.stock_actual <= p.stock_minimo) {
      estado = "critical";
    } else {
      const ratio = p.stock_maximo === p.stock_minimo ? 1.0 : (p.stock_actual - p.stock_minimo) / (p.stock_maximo - p.stock_minimo);
      const val = Math.min(Math.max(ratio, 0.0), 1.0);
      if (val <= 0.20) {
        estado = "critical";
      } else if (val <= 0.40) {
        estado = "warning";
      }
    }

    return {
      ...p,
      estado
    };
  });

  return {
    productos,
    categorias,
    movimientos,
    filters,
  };
}

const columnHelper = createColumnHelper<Producto & { estado: "normal" | "warning" | "critical" }>();

export default function Inventory({ loaderData }: Route.ComponentProps) {
  const [historyProductId, setHistoryProductId] = useState<number | null>(null);

  const totals = {
    total: loaderData.productos.length,
    critical: loaderData.productos.filter(p => p.estado === 'critical').length,
    warning: loaderData.productos.filter(p => p.estado === 'warning').length,
    normal: loaderData.productos.filter(p => p.estado === 'normal').length,
  };

  const historyProduct = loaderData.productos.find(p => p.id_producto === historyProductId);
  const productHistory = loaderData.movimientos.filter(m => m.id_producto === historyProductId);


  const columns = [
    columnHelper.accessor("nombre", {
      header: createSortableHeader("Producto / SKU"),
      filterFn: (row, _, value) => {
        const texto = value.toLowerCase();
        const nombre = row.original.nombre.toLowerCase();
        const sku = row.original.sku.toLowerCase();
        return nombre.includes(texto) || sku.includes(texto);
      },
      size: NaN,
      cell: (info) => (
        <div className="px-4 py-3">
          <p className="text-foreground">{info.getValue()}</p>
          <p className="text-xs text-muted-foreground font-mono">{info.row.original.sku}</p>
        </div>
      )
    }),
    columnHelper.accessor("categoria_nombre", {
      header: "Categoría",
      cell: (info) => (
        <div className="px-4 py-3 text-muted-foreground">{info.getValue()}</div>
      )
    }),
    columnHelper.accessor("stock_actual", {
      header: createSortableHeader("Stock"),
      filterFn: (row, _, value) => {
        switch (value) {
          case "Normal": return row.original.estado == "normal";
          case "Advertencia": return row.original.estado == "warning";
          case "Crítico": return row.original.estado == "critical";
          default: return false;
        }
      },
      cell: (info) => {
        const status = info.row.original.estado;
        return (
          <div className="px-4 py-3 text-center text-lg">
            <span className={status == "normal" ? "text-foreground" : (status == "warning" ? "text-yellow-600" : "text-destructive")}>
              {info.getValue()}
            </span>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "nivelStock",
      header: "Nivel de Stock",
      cell: (info) => {
        const p = info.row.original;
        const pct = p.stock_maximo > 0 ? Math.min((p.stock_actual / p.stock_maximo) * 100, 100) : 0;
        return (
          <div className="px-4 py-2">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${p.estado == "normal" ? "bg-green-500" : (p.estado == "warning" ? "bg-yellow-500" : "bg-destructive")}`} style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{pct.toFixed(0)}% del máximo</p>
          </div>
        );
      }
    }),
    columnHelper.display({
      id: "minmax",
      header: "Min / Max",
      cell: (info) => {
        const p = info.row.original;
        return <div className="px-4 py-3 text-center text-muted-foreground">{p.stock_minimo} / {p.stock_maximo}</div>;
      }
    }),
    columnHelper.accessor("precio", {
      header: createSortableHeader("Precio"),
      cell: (info) => <div className="px-4 py-3 text-center text-foreground">S/ {info.getValue()}</div>
    }),
    columnHelper.display({
      id: "historial",
      header: "Historial",
      cell: (info) => {
        return (
          <div className="flex justify-center">
            <button
              onClick={() => setHistoryProductId(info.row.original.id_producto)}
              className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground flex"
              title="Ver historial"
            >
              <History className="w-4 h-4" />
            </button>
          </div>
        );
      }
    })
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventario</h1>
          <p className="text-sm text-muted-foreground">Stock disponible con filtros por categoría y rango</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Productos', value: totals.total, color: 'text-foreground' },
          { label: 'Stock Crítico', value: totals.critical, color: 'text-destructive' },
          { label: 'Stock Bajo', value: totals.warning, color: 'text-yellow-600' },
          { label: 'Stock Normal', value: totals.normal, color: 'text-green-600' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-3xl mt-1 font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Inventory table */}
      <TableList columns={columns} data={loaderData.productos} filters={loaderData.filters} />

      {/* History dialog */}
      <Dialog open={!!historyProductId} onOpenChange={(open) => { if (!open) setHistoryProductId(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Historial de Movimientos — {historyProduct?.nombre}</DialogTitle>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto">
            {productHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Sin movimientos registrados</p>
            ) : (
              <table className="w-full text-xs">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-2 pr-3 text-muted-foreground">Fecha</th>
                    <th className="text-center py-2 pr-3 text-muted-foreground">Tipo</th>
                    <th className="text-center py-2 pr-3 text-muted-foreground">Cantidad</th>
                    <th className="text-left py-2 text-muted-foreground">Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productHistory.map(m => (
                    <tr key={m.id} className="border-b border-border/50">
                      <td className="py-2 pr-3 text-muted-foreground whitespace-nowrap">
                        {format(m.fecha, 'dd/MM/yy HH:mm', { locale: es })}
                      </td>
                      <td className="py-2 pr-3 text-center">
                        <Badge variant={m.tipo_movimiento === 'Entrada' ? 'outline' : 'secondary'} className="text-xs">
                          {m.tipo_movimiento}
                        </Badge>
                      </td>
                      <td className={`py-2 pr-3 text-center font-medium ${m.tipo_movimiento === 'Entrada' ? 'text-green-600' : 'text-red-600'}`}>
                        {m.tipo_movimiento === 'Entrada' ? '+' : '-'}{m.cantidad}
                      </td>
                      <td className="py-2 text-muted-foreground">{m.observaciones}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
