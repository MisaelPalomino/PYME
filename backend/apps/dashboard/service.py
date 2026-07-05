import json
from django.db import connection


class DashboardService:
    @staticmethod
    def obtener():
        with connection.cursor() as cursor:
            cursor.execute("SELECT get_dashboard();")
            return json.loads(cursor.fetchone()[0])
