from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .serializer import PedidoSerializer
from .service import PedidoService


class PedidoViewSet(viewsets.ViewSet):
    def list(self, request):
        pedidos = PedidoService.listar()

        serializer = PedidoSerializer(pedidos, many=True)

        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        pedido = PedidoService.obtener(pk)

        serializer = PedidoSerializer(pedido)

        return Response(serializer.data)

    def create(self, request):
        serializer = PedidoSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        pedido = PedidoService.crear(serializer)

        return Response(PedidoSerializer(pedido).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, pk=None):
        PedidoService.eliminar(pk)

        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["patch"], url_path="estado")
    def actualizar_estado(self, request, pk=None):

        estado = request.data.get("estado")

        if estado is None:
            return Response(
                {"error": "Debe enviar el campo 'estado'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        pedido = PedidoService.actualizar_estado(pk, estado)

        serializer = PedidoSerializer(pedido)

        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="recibir")
    def recibir(self, request, pk=None):

        pedido = PedidoService.recibir_pedido(pk)

        serializer = PedidoSerializer(pedido)

        return Response(serializer.data)
