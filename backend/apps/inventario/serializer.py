from rest_framework import serializers


class ProductoStockSerializer(serializers.Serializer):
    id_producto = serializers.IntegerField()
    nombre = serializers.CharField()
    stock_actual = serializers.IntegerField()
    estado_stock = serializers.CharField()


class InventarioStockSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    stock_agotado = serializers.IntegerField()
    stock_critico = serializers.IntegerField()
    stock_normal = serializers.IntegerField()
    productos = ProductoStockSerializer(many=True)


class HistorialMovimientoSerializer(serializers.Serializer):
    fecha = serializers.DateTimeField()
    tipo_movimiento = serializers.CharField()
    cantidad = serializers.IntegerField()
    observaciones = serializers.CharField(
        allow_blank=True,
        allow_null=True,
        required=False,
    )


class HistorialProductoSerializer(serializers.Serializer):
    id_producto = serializers.IntegerField()
    historial = HistorialMovimientoSerializer(many=True)