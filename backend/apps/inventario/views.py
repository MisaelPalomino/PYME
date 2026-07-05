from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializer import InventarioStockSerializer, HistorialProductoSerializer
from .service import InventarioService


class StockInventarioView(APIView):
 #   permission_classes = [IsAuthenticated]

    def get(self, request):
        categoria = request.query_params.get("categoria")
        productos = InventarioService.obtener_stock(categoria)

        data = {
            "total": len(productos),
            "stock_agotado": sum(
                1 for p in productos
                if p.get("estado_stock") == "Agotado"
            ),
            "stock_critico": sum(
                1 for p in productos
                if p.get("estado_stock") == "Critico"
            ),
            "stock_normal": sum(
                1 for p in productos
                if p.get("estado_stock") == "Normal"
            ),
            "productos": productos,
        }

        serializer = InventarioStockSerializer(data)
        return Response(serializer.data)


class HistorialProductoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id_producto):
        data = {
            "id_producto": id_producto,
            "historial": InventarioService.historial_producto(id_producto),
        }

        serializer = HistorialProductoSerializer(data)
        return Response(serializer.data)