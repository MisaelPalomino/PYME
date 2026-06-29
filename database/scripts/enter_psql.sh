#!/bin/bash

set -o allexport
source .env
set +o allexport

sudo docker compose exec db \
  psql -U "$DB_USERNAME" -d "$DB_NAME"
