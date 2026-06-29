#!/bin/bash

set -o allexport
source .env
set +o allexport

sudo docker compose exec db psql -U $DB_USERNAME -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
sudo docker compose exec db psql -U $DB_USERNAME -d postgres -c "CREATE DATABASE $DB_NAME;"
