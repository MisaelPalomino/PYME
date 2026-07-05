from datetime import timedelta

from django.db import connection
from django.utils import timezone

# ─── Configuración de períodos ────────────────────────────────────────────────
# Mapea el parámetro 'periodo' que llega del frontend ("Esta semana / Este mes / Trimestre / Año") a cuántos
# días hacia atrás se consulta
PERIODOS_DIAS = {
    'semana': 7,
    'mes': 30,
    'trimestre': 90,
    'anio': 365,
}

GRANULARIDAD_POR_PERIODO = {
    'semana': 'day',
    'mes': 'week',
    'trimestre': 'month',
    'anio': 'month',
}


def _dictfetchall(cursor):
    """Convierte el resultado de un cursor en una lista de diccionarios."""
    columnas = [col[0] for col in cursor.description]
    return [dict(zip(columnas, fila)) for fila in cursor.fetchall()]


def _dictfetchone(cursor):
    """Convierte la primera fila del cursor en un diccionario (o None)."""
    columnas = [col[0] for col in cursor.description]
    fila = cursor.fetchone()
    return dict(zip(columnas, fila)) if fila else None


def _fecha_desde(periodo):
    """Fecha de corte según el período solicitado (por defecto: 'mes')."""
    dias = PERIODOS_DIAS.get(periodo, PERIODOS_DIAS['mes'])
    return timezone.now() - timedelta(days=dias)


class ReporteService:
    """
    Consultas de solo lectura para el módulo de Informes y Reportes (RF15, RF16, RF17, RF19).
    """

    # ── RF15: Reporte de Bajo Stock ────────────────────────────────────────
    @staticmethod
    def bajo_stock(categoria=None):
        """
        Productos en o por debajo del stock mínimo, con categoría, déficit
        y lead time del proveedor principal.
        """
        sql = """
            SELECT
                p.id_producto,
                p.nombre,
                p.sku,
                c.nombre AS categoria,
                p.stock_actual,
                p.stock_minimo,
                (p.stock_minimo - p.stock_actual) AS deficit,
                pr.lead_time_dias,
                CASE WHEN p.stock_actual = 0 THEN 'Agotado' ELSE 'Critico' END AS estado
            FROM producto p
            JOIN categoria c ON c.id_categoria = p.id_categoria
            JOIN proveedor pr ON pr.id_proveedor = p.id_proveedor_principal
            WHERE p.stock_actual <= p.stock_minimo
              AND (%(categoria)s IS NULL OR p.id_categoria = %(categoria)s)
            ORDER BY (p.stock_actual::numeric / NULLIF(p.stock_minimo, 0)) ASC;
        """
        with connection.cursor() as cursor:
            cursor.execute(sql, {'categoria': categoria})
            return _dictfetchall(cursor)

    # ── RF16: Reporte de Rotación ──────────────────────────────────────────
    @staticmethod
    def rotacion(categoria=None, periodo='mes'):
        """
        Ventas del período vs. stock actual del producto (usado como
        'stock promedio') e índice de rotación = ventas_periodo / stock_actual.
        """
        fecha_desde = _fecha_desde(periodo)
        sql = """
            SELECT
                p.id_producto,
                p.nombre,
                p.sku,
                COALESCE(SUM(CASE WHEN m.tipo_movimiento = 'salida' THEN m.cantidad ELSE 0 END), 0) AS ventas_periodo,
                p.stock_actual AS stock_promedio,
                ROUND(
                    COALESCE(SUM(CASE WHEN m.tipo_movimiento = 'salida' THEN m.cantidad ELSE 0 END), 0)::numeric
                    / NULLIF(p.stock_actual, 0),
                    2
                ) AS indice_rotacion
            FROM producto p
            LEFT JOIN movimiento_inventario m
                ON m.id_producto = p.id_producto
               AND m.fecha >= %(fecha_desde)s
            WHERE (%(categoria)s IS NULL OR p.id_categoria = %(categoria)s)
            GROUP BY p.id_producto, p.nombre, p.sku, p.stock_actual
            ORDER BY ventas_periodo DESC;
        """
        with connection.cursor() as cursor:
            cursor.execute(sql, {'fecha_desde': fecha_desde, 'categoria': categoria})
            return _dictfetchall(cursor)

    # ── RF17: Reporte Consolidado ──────────────────────────────────────────
    @staticmethod
    def _consolidado_resumen():
        """Tarjetas: productos bajo stock, alertas críticas IA, MAE/MAPE promedio."""
        sql = """
            SELECT
                (SELECT COUNT(*) FROM producto WHERE stock_actual <= stock_minimo) AS productos_bajo_stock,
                (SELECT COUNT(*) FROM alerta WHERE tipo_alerta = 'Critica') AS alertas_criticas_ia,
                (SELECT ROUND(AVG(mae), 2) FROM modelo_ia) AS mae_promedio,
                (SELECT ROUND(AVG(mape), 2) FROM modelo_ia) AS mape_promedio;
        """
        with connection.cursor() as cursor:
            cursor.execute(sql)
            return _dictfetchone(cursor)

    @staticmethod
    def _consolidado_ultimas_semanas(semanas=4):
        """Serie semanal de compras y ventas (en monto) de las últimas N semanas."""
        fecha_desde = timezone.now() - timedelta(weeks=semanas)
        sql = """
            SELECT
                date_trunc('week', m.fecha) AS periodo,
                COALESCE(SUM(CASE WHEN m.tipo_movimiento = 'salida' THEN m.cantidad * p.precio ELSE 0 END), 0) AS ventas,
                COALESCE(SUM(CASE WHEN m.tipo_movimiento = 'entrada' THEN m.cantidad * p.precio ELSE 0 END), 0) AS compras
            FROM movimiento_inventario m
            JOIN producto p ON p.id_producto = m.id_producto
            WHERE m.fecha >= %(fecha_desde)s
            GROUP BY 1
            ORDER BY 1;
        """
        with connection.cursor() as cursor:
            cursor.execute(sql, {'fecha_desde': fecha_desde})
            return _dictfetchall(cursor)

    @staticmethod
    def _consolidado_metricas_por_producto():
        """
        Métricas de precisión IA por producto (MAE, MAPE, estado del modelo) y una clasificación de alerta
        calculada con la misma fórmula que generar_alertas_prediccion(): solo para mostrar en el reporte, no
        inserta filas en la tabla 'alerta'.
        """
        sql = """
            SELECT
                p.id_producto,
                p.nombre,
                mi.mae,
                mi.mape,
                mi.estado AS estado_modelo,
                CASE
                    WHEN pr.demanda_predicha IS NULL OR pr.demanda_predicha = 0 THEN 'Normal'
                    WHEN p.stock_actual / pr.demanda_predicha <= 3 THEN 'Critica'
                    WHEN p.stock_actual / pr.demanda_predicha <= 7 THEN 'Preventiva'
                    ELSE 'Normal'
                END AS alerta
            FROM producto p
            JOIN modelo_ia mi ON mi.id_producto = p.id_producto
            LEFT JOIN prediccion pr ON pr.id_producto = p.id_producto
            ORDER BY p.nombre;
        """
        with connection.cursor() as cursor:
            cursor.execute(sql)
            return _dictfetchall(cursor)

    @classmethod
    def consolidado(cls):
        """Agrupa las tres piezas del reporte consolidado en un solo dict."""
        return {
            'resumen': cls._consolidado_resumen(),
            'ultimas_semanas': cls._consolidado_ultimas_semanas(),
            'metricas_por_producto': cls._consolidado_metricas_por_producto(),
        }

    # ── RF19: Gráfico de Compras/Ventas ────────────────────────────────────
    @staticmethod
    def graficos_compras_ventas(categoria=None, periodo='mes'):
        """
        Serie de compras y ventas (en monto) filtrada por categoría y período, con granularidad adaptada
        al rango: por día si es 'semana', por semana si es 'mes', por mes si es 'trimestre' o 'anio'.
        """
        fecha_desde = _fecha_desde(periodo)
        granularidad = GRANULARIDAD_POR_PERIODO.get(periodo, 'week')
        sql = """
            SELECT
                date_trunc(%(granularidad)s, m.fecha) AS periodo,
                COALESCE(SUM(CASE WHEN m.tipo_movimiento = 'salida' THEN m.cantidad * p.precio ELSE 0 END), 0) AS ventas,
                COALESCE(SUM(CASE WHEN m.tipo_movimiento = 'entrada' THEN m.cantidad * p.precio ELSE 0 END), 0) AS compras
            FROM movimiento_inventario m
            JOIN producto p ON p.id_producto = m.id_producto
            WHERE m.fecha >= %(fecha_desde)s
              AND (%(categoria)s IS NULL OR p.id_categoria = %(categoria)s)
            GROUP BY 1
            ORDER BY 1;
        """
        with connection.cursor() as cursor:
            cursor.execute(sql, {
                'granularidad': granularidad,
                'fecha_desde': fecha_desde,
                'categoria': categoria,
            })
            return _dictfetchall(cursor)