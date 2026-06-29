# DB

## Iniciar base de datos

```bash
sudo docker compose up -d
```

## Para terminar

```bash
sudo docker compose down
```

## Drop, Create y Seed de DB

```bash
./reset_db.sh
```

## Inspeccion DB 

```bash
./scripts/enter_psql.sh
```
```
```

## Datos autenticacion
 En .env

```
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=unsa
DB_PASSWORD=unsa123
DB_NAME=pyme
```

