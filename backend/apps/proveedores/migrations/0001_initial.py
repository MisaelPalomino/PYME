import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Proveedor",
            fields=[
                (
                    "id_proveedor",
                    models.BigAutoField(
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "nombre",
                    models.CharField(max_length=255),
                ),
                (
                    "contacto",
                    models.CharField(max_length=255),
                ),
                (
                    "correo",
                    models.CharField(max_length=255),
                ),
                (
                    "telefono",
                    models.CharField(max_length=255),
                ),
                (
                    "lead_time_dias",
                    models.IntegerField(),
                ),
                (
                    "activo",
                    models.BooleanField(),
                ),
            ],
            options={
                "db_table": "proveedor",
            },
        ),
    ]

