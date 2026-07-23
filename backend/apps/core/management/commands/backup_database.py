import gzip
import os
from datetime import datetime

from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):
    help = "Crea un backup de la base de datos en formato JSON comprimido."

    def add_arguments(self, parser):
        parser.add_argument(
            "--output-dir",
            type=str,
            default="backups",
            help="Directorio donde se guardan los backups (default: backups/)",
        )
        parser.add_argument(
            "--keep",
            type=int,
            default=7,
            help="Número de backups a conservar (default: 7)",
        )

    def handle(self, *args, **options):
        output_dir = options["output_dir"]
        keep = options["keep"]

        os.makedirs(output_dir, exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"backup_{timestamp}.json.gz"
        filepath = os.path.join(output_dir, filename)

        self.stdout.write(f"Generando backup...")

        with gzip.open(filepath, "wt", encoding="utf-8") as f:
            call_command("dumpdata", "--natural-foreign", "--natural-primary", stdout=f)

        size_mb = os.path.getsize(filepath) / (1024 * 1024)
        self.stdout.write(self.style.SUCCESS(f"Backup creado: {filepath} ({size_mb:.2f} MB)"))

        backups = sorted(
            [f for f in os.listdir(output_dir) if f.startswith("backup_") and f.endswith(".json.gz")]
        )

        while len(backups) > keep:
            old = backups.pop(0)
            os.remove(os.path.join(output_dir, old))
            self.stdout.write(f"Eliminado backup antiguo: {old}")
