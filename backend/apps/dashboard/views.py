from rest_framework.views import APIView
from rest_framework.response import Response

from .service import DashboardService


class DashboardView(APIView):
    def get(self, request):
        data = DashboardService.obtener()
        return Response(data)
