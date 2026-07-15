from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .exportador import exportar_excel, exportar_pdf
from .serializer import (
    BajoStockItemSerializer,
    ConsolidadoSerializer,
    GraficoComprasVentasItemSerializer,
    RotacionItemSerializer,
)
from .service import ReporteService


def _categoria_param(request):
    valor = request.query_params.get('categoria')
    return int(valor) if valor not in (None, '', 'todas') else None

def _formato_param(request):
    """'excel' | 'pdf' | None (respuesta JSON normal)."""
    valor = request.query_params.get('formato')
    return valor if valor in ('excel', 'pdf') else None

class BajoStockView(APIView):
    """
    GET /api/informes/bajo-stock/?categoria=<id>&formato=<excel|pdf>
    Reporte de Bajo Stock (RF15). Sin 'formato', responde JSON.
    """
 
    def get(self, request):
        datos = ReporteService.bajo_stock(categoria=_categoria_param(request))
        formato = _formato_param(request)
 
        if formato:
            encabezados = [
                'Producto', 'SKU', 'Categoría', 'Stock Actual',
                'Stock Mínimo', 'Déficit', 'Lead Time (días)', 'Estado',
            ]
            filas = [
                [d['nombre'], d['sku'], d['categoria'], d['stock_actual'],
                 d['stock_minimo'], d['deficit'], d['lead_time_dias'], d['estado']]
                for d in datos
            ]
            if formato == 'excel':
                return exportar_excel('reporte_bajo_stock', [('Bajo Stock', encabezados, filas)])
            return exportar_pdf(
                'reporte_bajo_stock',
                'Reporte de Bajo Stock',
                [('Productos en o por debajo del stock mínimo', encabezados, filas)],
            )
 
        serializer = BajoStockItemSerializer(datos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RotacionView(APIView):
    """
    GET /api/informes/rotacion/?categoria=<id>&periodo=<...>&formato=<excel|pdf>
    Reporte de Rotación de Inventario (RF16).
    """
 
    def get(self, request):
        datos = ReporteService.rotacion(
            categoria=_categoria_param(request),
            periodo=request.query_params.get('periodo', 'mes'),
        )
        formato = _formato_param(request)
 
        if formato:
            encabezados = ['Producto', 'SKU', 'Ventas del Período', 'Stock Promedio', 'Índice de Rotación']
            filas = [
                [d['nombre'], d['sku'], d['ventas_periodo'], d['stock_promedio'], d['indice_rotacion']]
                for d in datos
            ]
            if formato == 'excel':
                return exportar_excel('reporte_rotacion', [('Rotación', encabezados, filas)])
            return exportar_pdf(
                'reporte_rotacion',
                'Reporte de Rotación de Inventario',
                [('Ventas vs. stock del período', encabezados, filas)],
            )
 
        serializer = RotacionItemSerializer(datos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ConsolidadoView(APIView):
    """
    GET /api/informes/consolidado/?formato=<excel|pdf>
    Reporte Consolidado (RF17): resumen + últimas semanas + métricas IA.
    """
 
    def get(self, request):
        datos = ReporteService.consolidado()
        formato = _formato_param(request)
 
        if formato:
            resumen = datos['resumen']
            encabezados_resumen = ['Productos Bajo Stock', 'Alertas Críticas IA', 'MAE Promedio', 'MAPE Promedio']
            filas_resumen = [[
                resumen['productos_bajo_stock'],
                resumen['alertas_criticas_ia'],
                resumen['mae_promedio'],
                resumen['mape_promedio'],
            ]]
 
            encabezados_semanas = ['Semana', 'Ventas (S/)', 'Compras (S/)']
            filas_semanas = [
                [s['periodo'].strftime('%d/%m/%Y'), s['ventas'], s['compras']]
                for s in datos['ultimas_semanas']
            ]
 
            encabezados_metricas = ['Producto', 'MAE', 'MAPE', 'Estado Modelo', 'Alerta']
            filas_metricas = [
                [m['nombre'], m['mae'], m['mape'], m['estado_modelo'], m['alerta']]
                for m in datos['metricas_por_producto']
            ]
 
            secciones = [
                ('Resumen', encabezados_resumen, filas_resumen),
                ('Compras y Ventas — Últimas 4 Semanas', encabezados_semanas, filas_semanas),
                ('Métricas de Precisión IA por Producto', encabezados_metricas, filas_metricas),
            ]
 
            if formato == 'excel':
                return exportar_excel('reporte_consolidado', [
                    ('Resumen', encabezados_resumen, filas_resumen),
                    ('Ultimas Semanas', encabezados_semanas, filas_semanas),
                    ('Metricas IA', encabezados_metricas, filas_metricas),
                ])
            return exportar_pdf('reporte_consolidado', 'Reporte Consolidado', secciones)
 
        serializer = ConsolidadoSerializer(datos)
        return Response(serializer.data, status=status.HTTP_200_OK)


class GraficoComprasVentasView(APIView):
    """
    GET /api/informes/graficos-compras-ventas/?categoria=<id>&periodo=<...>&formato=<excel|pdf>
    Gráfico de Compras/Ventas filtrado (RF19).
    """
 
    def get(self, request):
        datos = ReporteService.graficos_compras_ventas(
            categoria=_categoria_param(request),
            periodo=request.query_params.get('periodo', 'mes'),
        )
        formato = _formato_param(request)
 
        if formato:
            encabezados = ['Período', 'Ventas (S/)', 'Compras (S/)']
            filas = [
                [d['periodo'].strftime('%d/%m/%Y'), d['ventas'], d['compras']]
                for d in datos
            ]
            if formato == 'excel':
                return exportar_excel('grafico_compras_ventas', [('Compras vs Ventas', encabezados, filas)])
            return exportar_pdf(
                'grafico_compras_ventas',
                'Gráfico de Compras y Ventas',
                [('Filtrado por categoría y período seleccionado', encabezados, filas)],
            )
 
        serializer = GraficoComprasVentasItemSerializer(datos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
