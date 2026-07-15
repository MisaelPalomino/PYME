#!/bin/bash

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzgzMzgyNzMxLCJpYXQiOjE3ODMzNTM5MzEsImp0aSI6ImYwODMwNTBkY2I1MTQ5ZmQ4NDlmMzEwNmY2OWIzZTEyIiwidXNlcl9pZCI6IjEifQ.7bMTD-ziG0DgbbZ59CpmeKHCuXq8KdhMHV-ue0ypusY"

URL="http://localhost:8000/api/movimientos/"

AUTH=(
  -H "Authorization: Bearer $TOKEN"
  -H "Content-Type: application/json"
)

for producto in $(seq 1 120); do

    stock=$((RANDOM % 500 + 200))

    curl -X POST "$URL" \
        "${AUTH[@]}" \
        -d "{
            \"tipo_movimiento\":\"entrada\",
            \"id_producto\":$producto,
            \"cantidad\":$stock
        }"

    echo

    for ((i=1;i<=10;i++)); do

        cantidad=$((RANDOM % 20 + 1))

        curl -X POST "$URL" \
            "${AUTH[@]}" \
            -d "{
                \"tipo_movimiento\":\"salida\",
                \"id_producto\":$producto,
                \"cantidad\":$cantidad
            }"

        echo
    done
done