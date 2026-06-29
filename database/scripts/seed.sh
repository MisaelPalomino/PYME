#!/bin/bash

set -o allexport
source .env
set +o allexport

sudo PGPASSWORD=$DB_PASSWORD docker compose exec -T db psql -U $DB_USERNAME -d $DB_NAME <resources/data_usuarios.sql
sudo PGPASSWORD=$DB_PASSWORD docker compose exec -T db psql -U $DB_USERNAME -d $DB_NAME <resources/data_relacionada_productos.sql
sudo PGPASSWORD=$DB_PASSWORD docker compose exec -T db psql -U $DB_USERNAME -d $DB_NAME <resources/data_movimientos.sql
sudo PGPASSWORD=$DB_PASSWORD docker compose exec -T db psql -U $DB_USERNAME -d $DB_NAME <resources/data_notificaciones.sql
sudo PGPASSWORD=$DB_PASSWORD docker compose exec -T db psql -U $DB_USERNAME -d $DB_NAME <resources/data_pedidos.sql
