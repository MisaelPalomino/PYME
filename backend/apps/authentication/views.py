from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializer import (
    CambiarPasswordSerializer,
    LoginSerializer,
    RegistroUsuarioSerializer,
    UsuarioSerializer,
)
from .service import AuthService, UsuarioService


class LoginView(APIView):
    """
    Devuelve access + refresh token. No requiere autenticación previa.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        data = AuthService.login(user)
        return Response(data, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    Invalida el refresh token. Requiere autenticación.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {"detail": "Se requiere el campo 'refresh'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        AuthService.logout(refresh_token)
        return Response({"detail": "Sesión cerrada correctamente."}, status=status.HTTP_200_OK)


class UsuarioViewSet(viewsets.ViewSet):
    """
    Gestión de usuarios — solo accesible por Administrador.
    GET    /api/auth/usuarios/           --> listar
    POST   /api/auth/usuarios/           --> registrar
    GET    /api/auth/usuarios/{id}/      --> detalle
    PUT    /api/auth/usuarios/{id}/      --> editar
    DELETE /api/auth/usuarios/{id}/      --> desactivar cuenta
    POST   /api/auth/usuarios/{id}/cambiar_password/  --> cambiar contraseña propia
    """

    def get_permissions(self):
        # cambiar_password lo puede hacer cualquier usuario autenticado sobre sí mismo
        if self.action == 'cambiar_password':
            return [IsAuthenticated()]
        return [IsAuthenticated()]

    def list(self, request):
        usuarios = UsuarioService.listar()
        serializer = UsuarioSerializer(usuarios, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        usuario = UsuarioService.obtener(pk)
        serializer = UsuarioSerializer(usuario)
        return Response(serializer.data)

    def create(self, request):
        serializer = RegistroUsuarioSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        usuario = UsuarioService.crear(serializer)
        return Response(UsuarioSerializer(usuario).data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        usuario = UsuarioService.obtener(pk)
        serializer = UsuarioSerializer(usuario, data=request.data)
        serializer.is_valid(raise_exception=True)
        usuario = UsuarioService.actualizar(serializer)
        return Response(UsuarioSerializer(usuario).data)

    def destroy(self, request, pk=None):
        usuario = UsuarioService.obtener(pk)
        UsuarioService.desactivar(usuario)
        return Response(
            {"detail": "Cuenta desactivada correctamente."},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], url_path='cambiar_password')
    def cambiar_password(self, request, pk=None):
        usuario = UsuarioService.obtener(pk)
        serializer = CambiarPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        UsuarioService.cambiar_password(usuario, serializer.validated_data)
        return Response({"detail": "Contraseña actualizada correctamente."})