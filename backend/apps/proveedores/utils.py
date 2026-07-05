from datetime import timedelta
from django.db.models import F, Sum, Value, DateTimeField, ExpressionWrapper


class PedidoCalculos:
    """Utilidades para cálculos de pedidos."""

    @staticmethod
    def calcular_total(pedido):
        """Calcula el total de un pedido."""
        return sum(
            detalle.cantidad * detalle.precio_unitario
            for detalle in pedido.detallepedido_set.all()
        )

    @staticmethod
    def calcular_fecha_esperada(pedido):
        """Calcula la fecha esperada basada en el lead_time del proveedor."""
        if pedido.fecha_envio and pedido.id_proveedor:
            lead_time = pedido.id_proveedor.lead_time_dias or 0
            return pedido.fecha_envio + timedelta(days=lead_time)
        return None

    @staticmethod
    def get_annotations():
        """Devuelve las anotaciones para optimizar consultas."""
        return {
            "total": Sum(
                F("detallepedido__cantidad")
                * F("detallepedido__precio_unitario")  
            ),
            "fecha_esperada": ExpressionWrapper(
                F("fecha_envio")
                + (F("id_proveedor__lead_time_dias") * Value(timedelta(days=1))),
                output_field=DateTimeField(),
            ),
        }
