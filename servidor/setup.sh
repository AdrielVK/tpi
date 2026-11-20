#!/usr/bin/env bash
# ==============================================================================
# Script de Puesta en Marcha Integral - TPI SIG (Bash / Linux / macOS / WSL)
# Automatiza el despliegue completo:
# 1. Verificación de Docker y archivos
# 2. Levantamiento de contenedores (PostGIS, GeoServer, pgAdmin)
# 3. Restauración de la base de datos espacial (48 capas en esquema ign250)
# 4. Espera y configuración automática de GeoServer (Workspace, Store y Capas)
# ==============================================================================

set -e

# Asegurar estar en el directorio del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================================="
echo "   PUESTA EN MARCHA AUTOMÁTICA - ENTORNO TPI SIG        "
echo "=========================================================="

# 1. Comprobar Docker
echo -e "\n[1/6] Verificando Docker..."
if ! docker info >/dev/null 2>&1; then
    echo -e "\n[ERROR] Docker no está iniciado o no está corriendo."
    echo "Por favor inicialo y volvé a ejecutar este script."
    exit 1
fi
echo "  -> Docker está activo."

# 2. Levantar contenedores
echo -e "\n[2/6] Levantando contenedores Docker..."
docker compose up -d
echo "  -> Contenedores levantados."

# 3. Esperar PostGIS
echo -e "\n[3/6] Verificando PostGIS..."
until docker exec sig_postgis pg_isready -U postgres >/dev/null 2>&1; do
    echo -n "."
    sleep 2
done
echo -e "\n  -> PostgreSQL listo."

# Asegurar extensión PostGIS
docker exec sig_postgis psql -U postgres -d tpi -c "CREATE EXTENSION IF NOT EXISTS postgis;" >/dev/null 2>&1

# Verificar capas
LAYER_COUNT=$(docker exec sig_postgis psql -U postgres -d tpi -Atc "SELECT count(*) FROM geometry_columns WHERE f_table_schema='ign250';" 2>/dev/null || echo 0)

if [ "${LAYER_COUNT:-0}" -lt 47 ]; then
    if [ -f "$SCRIPT_DIR/tpi.dump" ]; then
        echo "  -> Restaurando base espacial desde tpi.dump..."
        docker cp "$SCRIPT_DIR/tpi.dump" sig_postgis:/tmp/tpi.dump
        docker exec -i sig_postgis pg_restore -U postgres -d tpi --no-owner --clean --if-exists /tmp/tpi.dump
        docker exec sig_postgis rm /tmp/tpi.dump
        echo "  -> Base restaurada con éxito."
    else
        echo "  -> [AVISO] No se encontró 'tpi.dump'. Descargalo del Google Drive."
    fi
else
    echo "  -> Base ya poblada ($LAYER_COUNT capas en esquema 'ign250')."
fi

# Asegurar tabla observaciones
docker exec sig_postgis psql -U postgres -d tpi -c "
    CREATE TABLE IF NOT EXISTS ign250.observaciones (
        gid SERIAL PRIMARY KEY,
        nombre VARCHAR(100),
        descripcion TEXT,
        categoria VARCHAR(50),
        fecha TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
        geom geometry(Point,4326)
    );
    CREATE INDEX IF NOT EXISTS idx_observaciones_geom ON ign250.observaciones USING gist(geom);
" >/dev/null 2>&1

# 4. Esperar arranque de GeoServer
echo -e "\n[4/6] Esperando arranque completo de GeoServer..."
GS="http://localhost:8081/geoserver/rest"
AUTH="admin:geoserver"

until curl -s -u "$AUTH" "$GS/about/version.json" -o /dev/null -w "%{http_code}" | grep -q "200"; do
    echo -n "."
    sleep 3
done
echo -e "\n  -> GeoServer online."

# 5. Workspace y DataStore
echo -e "\n[5/6] Configurando Workspace y DataStore en GeoServer..."
curl -s -u "$AUTH" -X POST -H "Content-type: text/xml" \
  -d "<workspace><name>sig</name></workspace>" \
  "$GS/workspaces" -o /dev/null 2>&1 || true

curl -s -u "$AUTH" -X POST -H "Content-type: text/xml" \
  -d "<dataStore>
        <name>ign250</name>
        <connectionParameters>
          <host>postgis</host>
          <port>5432</port>
          <database>tpi</database>
          <schema>ign250</schema>
          <user>postgres</user>
          <passwd>postgres</passwd>
          <dbtype>postgis</dbtype>
        </connectionParameters>
      </dataStore>" \
  "$GS/workspaces/sig/datastores" -o /dev/null 2>&1 || true

# 6. Publicar capas
echo -e "\n[6/6] Verificando y publicando capas..."
docker exec sig_postgis psql -U postgres -d tpi -Atc \
  "SELECT f_table_name FROM geometry_columns WHERE f_table_schema='ign250' ORDER BY f_table_name" |
while read -r t; do
    [ -z "$t" ] && continue
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" -u "$AUTH" "$GS/workspaces/sig/layers/$t.json")
    if [ "$STATUS" != "200" ]; then
        curl -s -u "$AUTH" -X POST -H "Content-type: text/xml" \
          -d "<featureType><name>$t</name><srs>EPSG:4326</srs></featureType>" \
          "$GS/workspaces/sig/datastores/ign250/featuretypes" -o /dev/null 2>&1
        echo "  [PUBLICADA] $t"
    fi
done

echo ""
echo "=========================================================="
echo "   ¡ENTORNO SIG LISTO Y FUNCIONANDO CON ÉXITO!           "
echo "=========================================================="
echo "• GeoServer Web:     http://localhost:8081/geoserver  (admin / geoserver)"
echo "• WMS Endpoint:      http://localhost:8081/geoserver/sig/wms"
echo "• WFS Endpoint:      http://localhost:8081/geoserver/sig/wfs"
echo "• PostgreSQL/PostGIS: localhost:5433 (user: postgres, pass: postgres, db: tpi)"
echo "• pgAdmin 4 Web:     http://localhost:5050 (admin@sig.com / admin)"
echo "=========================================================="
