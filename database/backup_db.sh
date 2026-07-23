#!/bin/bash
# Backup automático de la base de datos PostgreSQL via Django dumpdata
# Uso: ./backup_db.sh [directorio_destino] [keep]
#
# Ejemplo cron (diario a las 3 AM):
#   0 3 * * * /home/all23tor/PycharmProjects/PYME/database/backup_db.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_DIR/backend"
VENV_PYTHON="$PROJECT_DIR/.venv/bin/python"
OUTPUT_DIR="${1:-$PROJECT_DIR/database/backups}"
KEEP="${2:-7}"

cd "$BACKEND_DIR"

$VENV_PYTHON manage.py backup_database --output-dir "$OUTPUT_DIR" --keep "$KEEP"
