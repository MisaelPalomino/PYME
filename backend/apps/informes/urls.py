from django.urls import path

from .views import (
    BajoStockView,
    ConsolidadoView,
    GraficoComprasVentasView,
    RotacionView,
)

urlpatterns = [
    path('bajo-stock/', BajoStockView.as_view(), name='informes-bajo-stock'),
    path('rotacion/', RotacionView.as_view(), name='informes-rotacion'),
    path('consolidado/', ConsolidadoView.as_view(), name='informes-consolidado'),
    path('graficos-compras-ventas/', GraficoComprasVentasView.as_view(), name='informes-graficos-compras-ventas'),
]