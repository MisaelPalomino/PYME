#!/bin/bash

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

set -o allexport
source "$SCRIPT_DIR/../.env"
set +o allexport

sudo PGPASSWORD="$DB_PASSWORD" docker compose exec -T db \
  psql -U "$DB_USERNAME" -d "$DB_NAME" \
  <"$SCRIPT_DIR/../resources/create.sql"

sudo PGPASSWORD="$DB_PASSWORD" docker compose exec -T db \
  psql -U "$DB_USERNAME" -d "$DB_NAME" \
  <"$SCRIPT_DIR/../resources/funciones.sql"
