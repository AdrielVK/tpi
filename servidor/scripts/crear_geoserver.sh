#!/bin/bash
# Crea workspace, store PostGIS y publica todas las capas de ign250 en GeoServer.
# Ejecutar desde servidor/ con los contenedores levantados.
GS="http://localhost:8081/geoserver/rest"
AUTH="admin:geoserver"

echo "== Workspace"
curl -s -u "$AUTH" -XPOST -H "Content-type: text/xml" \
  -d "<workspace><name>sig</name></workspace>" \
  "$GS/workspaces" -o /dev/null -w "HTTP %{http_code}\n"

echo "== Store PostGIS"
curl -s -u "$AUTH" -XPOST -H "Content-type: text/xml" \
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
  "$GS/workspaces/sig/datastores" -o /dev/null -w "HTTP %{http_code}\n"

echo "== Publicando capas"
docker exec sig_postgis psql -U postgres -d tpi -Atc \
 "SELECT f_table_name FROM geometry_columns WHERE f_table_schema='ign250'" |
while read -r t; do
  echo "Publicando $t"
  curl -s -u "$AUTH" -XPOST -H "Content-type: text/xml" \
    -d "<featureType><name>$t</name><srs>EPSG:4326</srs></featureType>" \
    "$GS/workspaces/sig/datastores/ign250/featuretypes" -o /dev/null -w "  HTTP %{http_code}\n"
done
