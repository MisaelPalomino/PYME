# apps/ia/service.py
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from apps.core.models import Producto
from .models import Prediccion
from .utils import IACalculations


class IAService:

    @staticmethod
    def generar_prediccion_producto(producto_id):
        """
        Genera predicciones para un producto específico.
        """
        producto = get_object_or_404(Producto, pk=producto_id)
        
        modelo, mae, mape, n_muestras = IACalculations.entrenar_modelo(producto)
        
        if not modelo or n_muestras < 2:
            return {
                'producto_id': producto.id_producto,
                'producto_nombre': producto.nombre,
                'estado': 'sin_datos',
                'mensaje': f'No hay suficientes datos para entrenar (se necesitan al menos 2 movimientos de salida, actual: {n_muestras})',
                'n_muestras': n_muestras
            }
        
        predicciones = []
        for dias in [7, 14, 21]:
            demanda = IACalculations.predecir_demanda(modelo, producto, dias)
            
            prediccion = Prediccion.objects.create(
                id_producto=producto,
                horizonte_dias=dias,
                demanda_predicha=demanda
            )
            
            predicciones.append({
                'dias': dias,
                'demanda_predicha': demanda,
                'id_prediccion': prediccion.id_prediccion
            })
        
        return {
            'producto_id': producto.id_producto,
            'producto_nombre': producto.nombre,
            'estado': 'entrenado',
            'mae': mae,
            'mape': mape,
            'n_muestras': n_muestras,
            'predicciones': predicciones
        }

    @staticmethod
    def obtener_ultima_prediccion(producto_id, dias):
        """
        Obtiene la última predicción para un producto y horizonte de días.
        """
        producto = get_object_or_404(Producto, pk=producto_id)
        
        prediccion = Prediccion.objects.filter(
            id_producto=producto,
            horizonte_dias=dias
        ).order_by('-fecha_generacion').first()
        
        if not prediccion:
            return {
                'producto_id': producto.id_producto,
                'producto_nombre': producto.nombre,
                'dias': dias,
                'demanda_predicha': None,
                'mensaje': 'No hay predicción disponible. Genera una primero con /generar/'
            }
        
        return {
            'producto_id': producto.id_producto,
            'producto_nombre': producto.nombre,
            'dias': prediccion.horizonte_dias,
            'demanda_predicha': prediccion.demanda_predicha,
            'fecha_prediccion': prediccion.fecha_generacion
        }

    @staticmethod
    def listar_predicciones_producto(producto_id):
        """
        Lista todas las predicciones de un producto.
        """
        producto = get_object_or_404(Producto, pk=producto_id)
        
        predicciones = Prediccion.objects.filter(
            id_producto=producto
        ).order_by('-fecha_generacion', 'horizonte_dias')
        
        return [
            {
                'id_prediccion': p.id_prediccion,
                'dias': p.horizonte_dias,
                'demanda_predicha': p.demanda_predicha,
                'fecha_generacion': p.fecha_generacion
            }
            for p in predicciones
        ]

    @staticmethod
    def listar_productos_con_predicciones():
        """
        Lista todos los productos con sus últimas predicciones.
        """
        productos = Producto.objects.all()
        resultados = []
        
        for producto in productos:
            predicciones = {
                7: None,
                14: None,
                21: None
            }
            
            for dias in [7, 14, 21]:
                pred = Prediccion.objects.filter(
                    id_producto=producto,
                    horizonte_dias=dias
                ).order_by('-fecha_generacion').first()
                
                if pred:
                    predicciones[dias] = pred.demanda_predicha
            
            resultados.append({
                'producto_id': producto.id_producto,
                'producto_nombre': producto.nombre,
                'sku': producto.sku,
                'stock_actual': producto.stock_actual,
                'prediccion_7d': predicciones[7],
                'prediccion_14d': predicciones[14],
                'prediccion_21d': predicciones[21]
            })
        
        return resultados

    @staticmethod
    @transaction.atomic
    def generar_todas_predicciones():
        """
        Genera predicciones para todos los productos.
        """
        productos = Producto.objects.all()
        resultados = []
        
        for producto in productos:
            try:
                resultado = IAService.generar_prediccion_producto(producto.id_producto)
                resultados.append(resultado)
            except Exception as e:
                resultados.append({
                    'producto_id': producto.id_producto,
                    'producto_nombre': producto.nombre,
                    'error': str(e)
                })
        
        return {
            'total_productos': len(productos),
            'procesados': len(resultados),
            'resultados': resultados
        }