import { useState } from 'react';
import { Search, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { mockProductos, mockCategorias } from "~/dataMock";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { createColumnHelper } from '@tanstack/react-table';
import type { Producto } from '~/api/types';
import { createSortableHeader, TableList, type Filter } from '~/components/Table';

const columnHelper = createColumnHelper<Producto>();


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
    items: mockCategorias.map(x => x.nombre)
  },
  {
    type: "combobox",
    columnName: "stock_actual",
    placeholder: "Todos los rangos",
    items: ["Normal", "Advertencia", "Crítico"]
  }
];

export default function Inventory() {
  const [historyProductId, setHistoryProductId] = useState<number | null>(null);

  /*
  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || p.categoryId === categoryFilter;
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const historyProduct = products.find(p => p.id === historyProductId);
  const productHistory = movements.filter(m => m.productId === historyProductId);

  const statusConfig = {
    critical: { label: 'Crítico', variant: 'destructive' as const, bar: 'bg-destructive' },
    warning: { label: 'Warning', variant: 'warning' as const, bar: 'bg-yellow-500' },
    normal: { label: 'Normal', variant: 'outline' as const, bar: 'bg-green-500' },
  };

  */

  const totals = {
    total: mockProductos.length,
    critical: mockProductos.filter(p => p.estado === 'critical').length,
    warning: mockProductos.filter(p => p.estado === 'warning').length,
    normal: mockProductos.filter(p => p.estado === 'normal').length,
  };

  const columns = [
    columnHelper.accessor("nombre", {
      header: createSortableHeader("Producto / SKU"),
      filterFn: (row, _, value) => {
        const texto = value.toLowerCase();

        const nombre = row.original.nombre.toLowerCase();
        const sku = row.original.sku.toLowerCase();

        return (
          nombre.includes(texto) ||
          sku.includes(texto)
        );
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
            <span className={status == "normal" ? "text-foreground" : (status == "warning" ? "text-yellow-600" : "text-destructive")}>{info.getValue()}</span>
          </div>
        );
      },
    }),
    columnHelper.display({
      header: "Nivel de Stock",
      cell: (info) => {
        const p = info.row.original;
        const pct = p.stock_maximo > 0 ? Math.min((p.stock_actual / p.stock_maximo) * 100, 100) : 0;

        return (
          <>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${p.estado == "normal" ? "bg-green-500" : (p.estado == "warning" ? "bg-yellow-500" : "bg-destructive")}`} style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{pct.toFixed(0)}% del máximo</p>
          </>
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
          <h1 className="text-foreground">Inventario</h1>
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
              <p className={`text-3xl mt-1 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Inventory table */}
      <TableList columns={columns} data={mockProductos} filters={filters} />

      {/* History dialog */}
      {/*
      <Dialog open={!!historyProductId} onOpenChange={() => setHistoryProductId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Historial de Movimientos — {historyProduct?.name}</DialogTitle>
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
                        {format(m.date, 'dd/MM/yy HH:mm', { locale: es })}
                      </td>
                      <td className="py-2 pr-3 text-center">
                        <Badge variant={m.type === 'entrada' ? 'outline' : 'secondary'} className="text-xs">
                          {m.type === 'entrada' ? 'Entrada' : 'Salida'}
                        </Badge>
                      </td>
                      <td className={`py-2 pr-3 text-center ${m.type === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                        {m.type === 'entrada' ? '+' : '-'}{m.quantity}
                      </td>
                      <td className="py-2 text-muted-foreground">{m.observations}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>
      */}
    </div>
  );
}
