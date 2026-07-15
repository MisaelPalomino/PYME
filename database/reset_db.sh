#!/bin/bash

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

"$SCRIPT_DIR/scripts/drop_all.sh"
python3 ../backend/manage.py migrate
"$SCRIPT_DIR/scripts/create.sh"
"$SCRIPT_DIR/scripts/seed.sh"
