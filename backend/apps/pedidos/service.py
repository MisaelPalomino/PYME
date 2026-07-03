from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Pedido, DetallePedido


class PedidoService:

    @staticmethod
    def listar():
        return (
            Pedido.objects
            .select_related("id_proveedor", "id_usuario")
            .prefetch_related("detallepedido_set__id_producto")
            .order_by("-fecha_creacion")
        )

    @staticmethod
    def obtener(id_pedido):
        return get_object_or_404(
            Pedido.objects
            .select_related("id_proveedor", "id_usuario")
            .prefetch_related("detallepedido_set__id_producto"),
            pk=id_pedido,
        )

    @staticmethod
    @transaction.atomic
    def crear(serializer):

        datos = serializer.validated_data
        detalles = datos.pop("detalles")

        pedido = Pedido.objects.create(**datos)

        for detalle in detalles:
            DetallePedido.objects.create(
                id_pedido=pedido,
                **detalle
            )

        return pedido

    @staticmethod
    @transaction.atomic
    def actualizar_estado(id_pedido, estado):

        pedido = PedidoService.obtener(id_pedido)

        pedido.estado = estado

        if estado == "enviado":
            pedido.fecha_envio = timezone.now()

        pedido.save()

        return pedido

    @staticmethod
    @transaction.atomic
    def recibir_pedido(id_pedido):

        pedido = PedidoService.obtener(id_pedido)

        if pedido.estado == "recibido":
            raise ValueError(
                "Este pedido ya fue recibido."
            )

        pedido.estado = "recibido"
        pedido.fecha_recepcion = timezone.now()

        pedido.save()

        # Integración futura(Alberto):
        # InventarioService.registrar_entrada(pedido)

        return pedido

    @staticmethod
    @transaction.atomic
    def eliminar(id_pedido):

        pedido = PedidoService.obtener(id_pedido)

        if pedido.estado == "recibido":
            raise ValueError(
                "No se puede eliminar un pedido recibido."
            )

        pedido.delete()