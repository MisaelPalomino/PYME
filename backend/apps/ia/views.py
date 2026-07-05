# apps/ia/views.py
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny  
from rest_framework.response import Response

from .serializer import (
    ProductoPrediccionSerializer,
)
from .service import IAService


class IAPrediccionViewSet(viewsets.ViewSet):
    """
    ViewSet para predicciones de IA.
    """
    permission_classes = [AllowAny] 

    def list(self, request):
        """
        Lista todos los productos con sus predicciones.
        """
        data = IAService.listar_productos_con_predicciones()
        serializer = ProductoPrediccionSerializer(data, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='predicciones')
    def listar_predicciones(self, request, pk=None):
        """
        Lista todas las predicciones de un producto.
        """
        predicciones = IAService.listar_predicciones_producto(pk)
        return Response(predicciones)

    @action(detail=True, methods=['get'], url_path='prediccion/(?P<dias>[0-9]+)')
    def obtener_prediccion(self, request, pk=None, dias=None):
        """
        Obtiene la última predicción para un producto y días específicos.
        """
        dias = int(dias)
        if dias not in [7, 14, 21]:
            return Response(
                {'error': 'Los días deben ser 7, 14 o 21'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        prediccion = IAService.obtener_ultima_prediccion(pk, dias)
        return Response(prediccion)

    @action(detail=True, methods=['post'], url_path='generar')
    def generar_prediccion(self, request, pk=None):
        """
        Genera una nueva predicción para un producto.
        """
        try:
            resultado = IAService.generar_prediccion_producto(pk)
            return Response(resultado, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'], url_path='generar-todos')
    def generar_todos(self, request):
        """
        Genera predicciones para todos los productos.
        """
        try:
            resultado = IAService.generar_todas_predicciones()
            return Response(resultado, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )