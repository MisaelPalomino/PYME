from django.core.management.base import BaseCommand

from apps.ia.service import IAService


class Command(BaseCommand):
    help = "Reentrena el modelo de predicción para todos los productos."

    def handle(self, *args, **options):
        self.stdout.write("Iniciando reentrenamiento semanal...")

        resultado = IAService.generar_todas_predicciones()

        entrenados = sum(
            1 for r in resultado["resultados"] if r.get("estado") == "entrenado"
        )
        sin_datos = sum(
            1 for r in resultado["resultados"] if r.get("estado") == "sin_datos"
        )
        errores = sum(1 for r in resultado["resultados"] if "error" in r)

        self.stdout.write(
            self.style.SUCCESS(
                f"Reentrenamiento completo: {entrenados} entrenados, "
                f"{sin_datos} sin datos, {errores} errores "
                f"(total: {resultado['total_productos']})"
            )
        )
