#!/bin/bash

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

set -o allexport
source "$SCRIPT_DIR/../.env"
set +o allexport

sudo docker compose exec db \
  psql -U "$DB_USERNAME" -d "$DB_NAME"
