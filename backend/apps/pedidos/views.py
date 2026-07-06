from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .serializer import PedidoSerializer
from .service import PedidoService


class PedidoViewSet(viewsets.ViewSet):
    """
    ViewSet para la gestión de pedidos.

    Permite listar, consultar, crear, eliminar y actualizar el estado
    de los pedidos.
    """

    def list(self, request):
        """
        Lista todos los pedidos.
        """
        pedidos = PedidoService.listar()
        serializer = PedidoSerializer(pedidos, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        """
        Obtiene un pedido por su identificador.
        """
        pedido = PedidoService.obtener(pk)
        serializer = PedidoSerializer(pedido)
        return Response(serializer.data)

    def create(self, request):
        """
        Crea un nuevo pedido con sus detalles.
        """
        serializer = PedidoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        pedido = PedidoService.crear(serializer)

        return Response(
            PedidoSerializer(pedido).data,
            status=status.HTTP_201_CREATED,
        )

    def destroy(self, request, pk=None):
        """
        Elimina un pedido.

        Solo se permite eliminar pedidos que no hayan sido recibidos.
        """
        try:
            PedidoService.eliminar(pk)
            return Response(status=status.HTTP_204_NO_CONTENT)

        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["patch"], url_path="estado")
    def actualizar_estado(self, request, pk=None):
        """
        Actualiza el estado de un pedido.

        Estados permitidos:
        - pendiente
        - enviado
        - recibido
        """
        estado = request.data.get("estado")

        if estado is None:
            return Response(
                {"error": "Debe enviar el campo 'estado'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            pedido = PedidoService.actualizar_estado(pk, estado)
            serializer = PedidoSerializer(pedido)
            return Response(serializer.data)

        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["post"], url_path="recibir")
    def recibir(self, request, pk=None):
        """
        Marca un pedido como recibido y registra su fecha de recepción.
        """
        try:
            pedido = PedidoService.recibir_pedido(pk)
            serializer = PedidoSerializer(pedido)
            return Response(serializer.data)

        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )