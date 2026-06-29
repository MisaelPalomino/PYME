#!/bin/bash

set -o allexport
source .env
set +o allexport

sudo PGPASSWORD=$DB_PASSWORD docker compose exec -T db \
  psql -U $DB_USERNAME -d $DB_NAME \
  <resources/create.sql
