from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializer import MovimientoCreateSerializer, MovimientoSerializer
from .service import MovimientoService


class MovimientoListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tipo = request.query_params.get('tipo')          # 'entrada' | 'salida' | None (Todos)
        busqueda = request.query_params.get('busqueda')   # texto: nombre o SKU de producto
        movimientos = MovimientoService.listar(tipo=tipo, busqueda=busqueda)
        serializer = MovimientoSerializer(movimientos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = MovimientoCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        datos = serializer.validated_data

        movimiento = MovimientoService.registrar(
            tipo_movimiento=datos['tipo_movimiento'],
            id_producto=datos['id_producto'],
            cantidad=datos['cantidad'],
            id_usuario=request.user.id_usuario,
            observaciones=datos.get('observaciones', ''),
        )
        return Response(
            MovimientoSerializer(movimiento).data,
            status=status.HTTP_201_CREATED,
        )