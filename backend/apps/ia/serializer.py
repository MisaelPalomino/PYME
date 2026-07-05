# apps/ia/serializer.py
from rest_framework import serializers
from .models import Prediccion


class PrediccionSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(
        source='id_producto.nombre',
        read_only=True
    )
    
    class Meta:
        model = Prediccion
        fields = [
            'id_prediccion',
            'id_producto',
            'producto_nombre',
            'horizonte_dias',
            'demanda_predicha',
            'fecha_generacion'
        ]


class ProductoPrediccionSerializer(serializers.Serializer):
    """Serializer para mostrar productos con sus predicciones."""
    producto_id = serializers.IntegerField()
    producto_nombre = serializers.CharField()
    sku = serializers.CharField()
    stock_actual = serializers.IntegerField()
    prediccion_7d = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True)
    prediccion_14d = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True)
    prediccion_21d = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True)


class GenerarPrediccionSerializer(serializers.Serializer):
    producto_id = serializers.IntegerField()
    producto_nombre = serializers.CharField()
    estado = serializers.CharField()
    mensaje = serializers.CharField(required=False)
    mae = serializers.DecimalField(max_digits=10, decimal_places=4, required=False)
    mape = serializers.DecimalField(max_digits=10, decimal_places=4, required=False)
    n_muestras = serializers.IntegerField()
    predicciones = serializers.ListField(required=False)