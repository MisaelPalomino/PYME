# apps/pedidos/service.py
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from apps.movimientos.models import Movimiento
from apps.inventario.models import Alerta

from .models import Pedido, DetallePedido
from .utils import PedidoCalculos


class PedidoService:
    @staticmethod
    def _get_base_queryset():
        """
        metodo privado que devuelve el queryset base con anotaciones.
        para evitar duplicar código
        """
        return (
            Pedido.objects.select_related("id_proveedor", "id_usuario")
            .prefetch_related("detallepedido_set__id_producto")
            .annotate(**PedidoCalculos.get_annotations())
        )

    @staticmethod
    def listar():
        """
        ñista todos los pedidos con total y fecha_esperada calculados.
        """
        return PedidoService._get_base_queryset().order_by("-fecha_creacion")

    @staticmethod
    def obtener(id_pedido):
        """
        obtiene un pedido específico con total y fecha_esperada calculados.
        """
        return get_object_or_404(PedidoService._get_base_queryset(), pk=id_pedido)

    @staticmethod
    @transaction.atomic
    def crear(serializer):
        """
        Crea un pedido con sus detalles.
        """
        datos = serializer.validated_data
        detalles = datos.pop("detalles")

        pedido = Pedido.objects.create(**datos)

        for detalle in detalles:
            DetallePedido.objects.create(id_pedido=pedido, **detalle)

        return pedido

    @staticmethod
    @transaction.atomic
    def actualizar_estado(id_pedido, estado):
        """
        Actualiza el estado de un pedido
        """
        estados_validos = ["pendiente", "enviado", "recibido"]

        if estado not in estados_validos:
            raise ValueError(f"Estado inválido. Opciones: {', '.join(estados_validos)}")

        pedido = PedidoService.obtener(id_pedido)

        # No permitir cambiar de 'recibido' a otro estado
        if pedido.estado == "recibido":
            raise ValueError("No se puede cambiar el estado de un pedido recibido.")

        pedido.estado = estado

        if estado == "enviado":
            pedido.fecha_envio = timezone.now()

        pedido.save()
        return pedido

    @staticmethod
    @transaction.atomic
    def recibir_pedido(id_pedido):
        """
        Marca un pedido como recibido y actualiza el stock.
        """
        pedido = PedidoService.obtener(id_pedido)

        if pedido.estado == "recibido":
            raise ValueError("Este pedido ya fue recibido.")

        pedido.estado = "recibido"
        pedido.fecha_recepcion = timezone.now()
        pedido.save()

        for detalle in pedido.detallepedido_set.select_related(
            "id_producto"
        ).all():
            producto = detalle.id_producto
            producto.stock_actual += detalle.cantidad
            producto.save(update_fields=["stock_actual"])

            Movimiento.objects.create(
                id_producto=producto,
                tipo_movimiento="entrada",
                cantidad=detalle.cantidad,
                observaciones=f"Recepción de Pedido #{pedido.id_pedido}",
                fecha=timezone.now(),
                id_usuario=pedido.id_usuario,
            )

            if producto.stock_actual <= producto.stock_minimo:
                tipo = (
                    "critico" if producto.stock_actual == 0 else "bajo"
                )
                Alerta.objects.update_or_create(
                    id_producto=producto,
                    tipo_alerta=tipo,
                    leida=False,
                    defaults={
                        "mensaje": f"Stock {tipo}: {producto.nombre}"
                    },
                )

        return pedido

    @staticmethod
    @transaction.atomic
    def eliminar(id_pedido):
        """
        Elimina un pedido solo si no está recibido.
        """
        pedido = PedidoService.obtener(id_pedido)

        if pedido.estado == "recibido":
            raise ValueError("No se puede eliminar un pedido recibido.")

        pedido.delete()
