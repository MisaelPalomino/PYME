#!/bin/bash
# Reentrenamiento semanal del modelo de predicción IA
# Uso: ./retrain_weekly.sh
#
# Ejemplo cron (domingos a las 2 AM):
#   0 2 * * 0 /home/all23tor/PycharmProjects/PYME/database/retrain_weekly.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_DIR/backend"
VENV_PYTHON="$PROJECT_DIR/.venv/bin/python"

cd "$BACKEND_DIR"

$VENV_PYTHON manage.py retrain_models
