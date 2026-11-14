#!/bin/bash
# Uso: ./cargar_capas.sh  (ejecutar desde servidor/)

DATOS="capas/datos"
PG="PG:host=localhost port=5433 dbname=tpi user=postgres password=postgres"
LOG="carga.log"
: > "$LOG"

find "$DATOS" -iname "*.shp" | sort | while read -r f; do
  # nombre de tabla: minúsculas, sin tildes, solo letras/números/_
  nombre=$(basename "$f" .shp | iconv -f UTF-8 -t ASCII//TRANSLIT \
           | tr 'A-Z' 'a-z' | sed 's/[^a-z0-9]/_/g')

  echo ">> Cargando $nombre"
  ogr2ogr -f PostgreSQL "$PG" "$f" \
    -nln "$nombre" \
    -lco SCHEMA=ign250 \
    -lco GEOMETRY_NAME=geom \
    -lco FID=gid \
    -lco PRECISION=NO \
    -nlt PROMOTE_TO_MULTI \
    -overwrite \
    --config SHAPE_ENCODING LATIN1 \
    >> "$LOG" 2>&1 \
    && echo "   OK" || echo "   ERROR (ver $LOG)"
done
