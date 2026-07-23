#!/bin/bash
# Levanta todo el proyecto PYME: DB, backend y frontend
# Uso: ./start.sh [--reset-db]

set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
PYTHON="$DIR/.venv/bin/python"
PIDS=()

cleanup() {
    echo ""
    echo "Deteniendo..."
    for pid in "${PIDS[@]}"; do kill "$pid" 2>/dev/null; done
    exit 0
}
trap cleanup SIGINT SIGTERM

# PostgreSQL
if ! pgrep -x postgres >/dev/null 2>&1; then
    echo "Iniciando PostgreSQL..."
    docker compose -f "$DIR/database/compose.yml" up -d 2>/dev/null || {
        echo "Error: PostgreSQL no disponible"; exit 1
    }
    sleep 3
fi
echo "✓ PostgreSQL OK"

# Reset DB
[[ "$1" == "--reset-db" ]] && { echo "Reseteando DB..."; cd "$DIR/database" && ./reset_db.sh; }

# Migraciones
echo "Migrando..."
$PYTHON "$DIR/backend/manage.py" migrate --verbosity=0

# Cron
mkdir -p "$DIR/logs"
if command -v crontab &>/dev/null; then
    (crontab -l 2>/dev/null | grep -v "backup_db.sh\|retrain_weekly.sh"
     echo "0 3 * * 0 $DIR/database/backup_db.sh >> $DIR/logs/backup.log 2>&1"
     echo "0 2 * * 0 $DIR/database/retrain_weekly.sh >> $DIR/logs/retrain.log 2>&1"
    ) | crontab -
    echo "✓ Cron configurado (backup dom 3AM, retrain dom 2AM)"
fi

# Backend
echo "Iniciando backend en :8000..."
$PYTHON "$DIR/backend/manage.py" runserver 0.0.0.0:8000 > "$DIR/logs/backend.log" 2>&1 &
PIDS+=($!)

# Frontend
echo "Iniciando frontend en :5173..."
cd "$DIR/frontend" && pnpm dev > "$DIR/logs/frontend.log" 2>&1 &
PIDS+=($!)

sleep 3
echo ""
echo "================================"
echo "  PYME corriendo"
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:5173"
echo "  Ctrl+C para detener"
echo "================================"

wait
