from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response

class RegistrarMovimientoView(APIView):
    def post(self, request):

        data = request.data

        with connection.cursor() as cursor:

            cursor.execute(
                """
                SELECT stock_actual
                FROM producto
                WHERE id_producto = %s
                """,
                [data["id_producto"]]
            )

            fila = cursor.fetchone()

            if fila is None:
                return Response(
                    {"error": "Producto no encontrado"},
                    status=404
                )

            stock_actual = fila[0]

            if (
                data["tipo"] == "salida"
                and data["cantidad"] > stock_actual
            ):
                return Response(
                    {"error": "Stock insuficiente"},
                    status=400
                )

            cursor.execute(
                """
                SELECT registrar_movimiento(%s,%s,%s,%s,%s)
                """,
                [
                    data["tipo"],
                    data["id_producto"],
                    data["cantidad"],
                    data["id_usuario"],
                    data["descripcion"],
                ],
            )

        return Response(
            {"mensaje": "Movimiento registrado"},
            status=201
        )