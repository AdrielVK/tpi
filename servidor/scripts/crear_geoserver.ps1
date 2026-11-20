# Crea workspace, store PostGIS y publica todas las capas de ign250 en GeoServer.
# Ejecutar desde servidor/ con los contenedores levantados.
$GS = "http://localhost:8081/geoserver/rest"
$AUTH = "admin:geoserver"

Write-Host "== Creando Workspace 'sig'..."
curl.exe -s -u $AUTH -X POST -H "Content-type: text/xml" -d "<workspace><name>sig</name></workspace>" "$GS/workspaces" -o $null -w "HTTP %{http_code}`n"

Write-Host "== Creando Store PostGIS 'ign250'..."
$storeXml = @"
<dataStore>
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
</dataStore>
"@
curl.exe -s -u $AUTH -X POST -H "Content-type: text/xml" -d $storeXml "$GS/workspaces/sig/datastores" -o $null -w "HTTP %{http_code}`n"

Write-Host "== Publicando capas de ign250..."
$tables = docker exec sig_postgis psql -U postgres -d tpi -Atc "SELECT f_table_name FROM geometry_columns WHERE f_table_schema='ign250'"

foreach ($t in ($tables -split "`r?`n")) {
    $t = $t.Trim()
    if ($t) {
        Write-Host "Publicando $t"
        $featureXml = "<featureType><name>$t</name><srs>EPSG:4326</srs></featureType>"
        curl.exe -s -u $AUTH -X POST -H "Content-type: text/xml" -d $featureXml "$GS/workspaces/sig/datastores/ign250/featuretypes" -o $null -w "  HTTP %{http_code}`n"
    }
}
Write-Host "== Finalizado. Capas publicadas en workspace 'sig'."
