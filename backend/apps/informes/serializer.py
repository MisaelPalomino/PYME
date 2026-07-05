from rest_framework import serializers


class BajoStockItemSerializer(serializers.Serializer):
    """Fila del reporte 'Bajo Stock' (RF15)."""
    id_producto = serializers.IntegerField()
    nombre = serializers.CharField()
    sku = serializers.CharField()
    categoria = serializers.CharField()
    stock_actual = serializers.IntegerField()
    stock_minimo = serializers.IntegerField()
    deficit = serializers.IntegerField()
    lead_time_dias = serializers.IntegerField()
    estado = serializers.CharField()  # 'Agotado' | 'Critico'


class RotacionItemSerializer(serializers.Serializer):
    """
    Fila del reporte 'Rotación de Inventario' (RF16).
    NOTA: stock_promedio corresponde a producto.stock_actual, pero se mantiene el nombre por consistencia con el frontend.
    """
    id_producto = serializers.IntegerField()
    nombre = serializers.CharField()
    sku = serializers.CharField()
    ventas_periodo = serializers.IntegerField()
    stock_promedio = serializers.IntegerField()
    indice_rotacion = serializers.DecimalField(max_digits=6, decimal_places=2, allow_null=True)


class ConsolidadoResumenSerializer(serializers.Serializer):
    """Tarjetas resumen del reporte 'Consolidado' (RF17)."""
    productos_bajo_stock = serializers.IntegerField()
    alertas_criticas_ia = serializers.IntegerField()
    mae_promedio = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True)
    mape_promedio = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True)


class ConsolidadoSemanaSerializer(serializers.Serializer):
    """Punto de la serie 'Compras, Ventas y Stock Promedio' de las últimas semanas."""
    periodo = serializers.DateTimeField()
    ventas = serializers.DecimalField(max_digits=12, decimal_places=2)
    compras = serializers.DecimalField(max_digits=12, decimal_places=2)


class ConsolidadoMetricaProductoSerializer(serializers.Serializer):
    """
    Fila de 'Métricas de Precisión IA por Producto'. El campo 'alerta' se calcula con la misma fórmula
    que generar_alertas_prediccion(): solo para mostrarla en el reporte, no inserta filas en la tabla 'alerta'.
    """
    id_producto = serializers.IntegerField()
    nombre = serializers.CharField()
    mae = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True)
    mape = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True)
    estado_modelo = serializers.CharField(allow_null=True)
    alerta = serializers.CharField()  # 'Critica' | 'Preventiva' | 'Normal'


class ConsolidadoSerializer(serializers.Serializer):
    """Agrupa las tres piezas del reporte consolidado en una sola respuesta."""
    resumen = ConsolidadoResumenSerializer()
    ultimas_semanas = ConsolidadoSemanaSerializer(many=True)
    metricas_por_producto = ConsolidadoMetricaProductoSerializer(many=True)


class GraficoComprasVentasItemSerializer(serializers.Serializer):
    """Punto del gráfico de Compras/Ventas filtrado por categoría y período."""
    periodo = serializers.DateTimeField()
    ventas = serializers.DecimalField(max_digits=12, decimal_places=2)
    compras = serializers.DecimalField(max_digits=12, decimal_places=2)