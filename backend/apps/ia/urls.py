# apps/ia/urls.py
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import IAPrediccionViewSet

router = DefaultRouter()
router.register(r'predicciones', IAPrediccionViewSet, basename='predicciones')

urlpatterns = [
    path('', include(router.urls)),
]