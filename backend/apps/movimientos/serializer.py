from rest_framework import serializers

from .models import Movimiento

class MovimientoCreateSerializer(serializers.Serializer):
    tipo_movimiento = serializers.ChoiceField(choices=Movimiento.TIPO_CHOICES)
    id_producto = serializers.IntegerField()
    cantidad = serializers.IntegerField(min_value=1)
    observaciones = serializers.CharField(allow_blank=True, required=False, default='')


class MovimientoSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='id_producto.nombre', read_only=True)
    producto_sku = serializers.CharField(source='id_producto.sku', read_only=True)
    responsable = serializers.CharField(source='id_usuario.nombre', read_only=True)

    class Meta:
        model = Movimiento
        fields = (
            'id_movimiento',
            'producto_nombre',
            'producto_sku',
            'tipo_movimiento',
            'cantidad',
            'responsable',
            'fecha',
            'observaciones',
        )