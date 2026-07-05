from django.db import connection


class InventarioService:

    @staticmethod
    def dictfetchall(cursor):
        columns = [col[0] for col in cursor.description]
        return [
            dict(zip(columns, row))
            for row in cursor.fetchall()
        ]

    @staticmethod
    def obtener_stock(categoria=None):
        with connection.cursor() as cursor:
            if categoria:
                cursor.execute(
                    "SELECT * FROM obtener_stock_por_estado(%s)",
                    [categoria],
                )
            else:
                cursor.execute(
                    "SELECT * FROM obtener_stock_por_estado()"
                )

            return InventarioService.dictfetchall(cursor)

    @staticmethod
    def historial_producto(id_producto):
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM historial_producto(%s)",
                [id_producto],
            )

            return InventarioService.dictfetchall(cursor)