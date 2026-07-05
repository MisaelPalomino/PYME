from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

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


class BajoStockView(APIView):
    """GET /api/informes/bajo-stock/?categoria=<id> -> Reporte de Bajo Stock (RF15)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        datos = ReporteService.bajo_stock(categoria=_categoria_param(request))
        serializer = BajoStockItemSerializer(datos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RotacionView(APIView):
    """GET /api/informes/rotacion/?categoria=<id>&periodo=<semana|mes|trimestre|anio> -> RF16."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        datos = ReporteService.rotacion(
            categoria=_categoria_param(request),
            periodo=request.query_params.get('periodo', 'mes'),
        )
        serializer = RotacionItemSerializer(datos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ConsolidadoView(APIView):
    """GET /api/informes/consolidado/ -> Reporte Consolidado (RF17)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        datos = ReporteService.consolidado()
        serializer = ConsolidadoSerializer(datos)
        return Response(serializer.data, status=status.HTTP_200_OK)


class GraficoComprasVentasView(APIView):
    """
    GET /api/informes/graficos-compras-ventas/?categoria=<id>&periodo=<...>
    -> Gráfico de Compras/Ventas filtrado (RF19).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        datos = ReporteService.graficos_compras_ventas(
            categoria=_categoria_param(request),
            periodo=request.query_params.get('periodo', 'mes'),
        )
        serializer = GraficoComprasVentasItemSerializer(datos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)