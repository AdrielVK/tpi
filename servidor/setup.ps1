# ==============================================================================
# Script de Puesta en Marcha Integral - TPI SIG (Windows PowerShell)
# Automatiza el despliegue completo:
# 1. Verificación de Docker y archivos
# 2. Levantamiento de contenedores (PostGIS, GeoServer, pgAdmin)
# 3. Restauración de la base de datos espacial (48 capas en esquema ign250)
# 4. Espera y configuración automática de GeoServer (Workspace, Store y Capas)
# ==============================================================================

$ErrorActionPreference = "Continue"

# Directorio base (carpeta servidor)
$ServidorDir = $PSScriptRoot
Set-Location $ServidorDir

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   PUESTA EN MARCHA AUTOMÁTICA - ENTORNO TPI SIG        " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Comprobar Docker
Write-Host "`n[1/6] Verificando Docker Desktop..." -ForegroundColor Yellow
$dockerInfo = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[ERROR] Docker Desktop no está iniciado o no está corriendo." -ForegroundColor Red
    Write-Host "Por favor, abrí Docker Desktop y volvé a ejecutar este script." -ForegroundColor Red
    exit 1
}
Write-Host "  -> Docker está corriendo correctamente." -ForegroundColor Green

# 2. Levantar los contenedores
Write-Host "`n[2/6] Levantando contenedores Docker..." -ForegroundColor Yellow
docker compose up -d 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Falló 'docker compose up -d'." -ForegroundColor Red
    exit 1
}
Write-Host "  -> Contenedores levantados." -ForegroundColor Green

# 3. Esperar a PostGIS y verificar la base de datos
Write-Host "`n[3/6] Verificando servidor PostgreSQL + PostGIS..." -ForegroundColor Yellow
$pgReady = $false
for ($i = 0; $i -lt 30; $i++) {
    $null = docker exec sig_postgis pg_isready -U postgres 2>&1
    if ($LASTEXITCODE -eq 0) {
        $pgReady = $true
        break
    }
    Start-Sleep -Seconds 2
}

if (-not $pgReady) {
    Write-Host "[ERROR] PostGIS no respondió a tiempo." -ForegroundColor Red
    exit 1
}

# Asegurar extensión PostGIS
$null = docker exec sig_postgis psql -U postgres -d tpi -c "CREATE EXTENSION IF NOT EXISTS postgis;" 2>&1

# Verificar si las capas ya están cargadas
$layerCount = docker exec sig_postgis psql -U postgres -d tpi -Atc "SELECT count(*) FROM geometry_columns WHERE f_table_schema='ign250';" 2>&1
$layerCountInt = 0
[int]::TryParse($layerCount.ToString().Trim(), [ref]$layerCountInt) > $null

if ($layerCountInt -lt 47) {
    $dumpPath = Join-Path $ServidorDir "tpi.dump"
    if (Test-Path $dumpPath) {
        Write-Host "  -> Restaurando base de datos espacial desde tpi.dump (276 MB)..." -ForegroundColor Cyan
        docker cp "$dumpPath" sig_postgis:/tmp/tpi.dump
        docker exec -i sig_postgis pg_restore -U postgres -d tpi --no-owner --clean --if-exists /tmp/tpi.dump 2>&1 | Out-Null
        docker exec sig_postgis rm /tmp/tpi.dump 2>&1 | Out-Null
        Write-Host "  -> Restauración finalizada con éxito." -ForegroundColor Green
    } else {
        Write-Host "  -> [AVISO] No se encontró 'tpi.dump' en la carpeta servidor." -ForegroundColor Yellow
        Write-Host "     Descárgalo del Google Drive del equipo para poblar la base." -ForegroundColor Yellow
    }
} else {
    Write-Host "  -> Base de datos ya poblada ($layerCountInt capas en esquema 'ign250')." -ForegroundColor Green
}

# Asegurar tabla 'observaciones' para edición WFS-T
$tableObsCheck = docker exec sig_postgis psql -U postgres -d tpi -Atc "SELECT to_regclass('ign250.observaciones');" 2>&1
if (-not $tableObsCheck.ToString().Trim()) {
    Write-Host "  -> Creando tabla editable 'ign250.observaciones'..." -ForegroundColor Cyan
    $null = docker exec sig_postgis psql -U postgres -d tpi -c "
        CREATE TABLE IF NOT EXISTS ign250.observaciones (
            gid SERIAL PRIMARY KEY,
            nombre VARCHAR(100),
            descripcion TEXT,
            categoria VARCHAR(50),
            fecha TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
            geom geometry(Point,4326)
        );
        CREATE INDEX IF NOT EXISTS idx_observaciones_geom ON ign250.observaciones USING gist(geom);
    " 2>&1
}

# 4. Esperar arranque completo de GeoServer
Write-Host "`n[4/6] Esperando a que GeoServer inicialice por completo..." -ForegroundColor Yellow
Write-Host "      (Puede demorar entre 1 y 2 minutos en máquinas nuevas)..." -ForegroundColor Gray

$GS = "http://127.0.0.1:8081/geoserver/rest"
$AUTH = "admin:geoserver"

$gsReady = $false
for ($i = 0; $i -lt 45; $i++) {
    $code = curl.exe -m 3 -s -o NUL -w "%{http_code}" -u $AUTH "$GS/about/version.json"
    if ($code -eq "200") {
        $gsReady = $true
        break
    }
    Write-Host "." -NoNewline
    Start-Sleep -Seconds 3
}
Write-Host ""

if (-not $gsReady) {
    Write-Host "[ERROR] GeoServer no respondió luego del tiempo esperado." -ForegroundColor Red
    Write-Host "Revisá los logs con: docker compose logs geoserver" -ForegroundColor Yellow
    exit 1
}
Write-Host "  -> GeoServer está online y listo." -ForegroundColor Green

# 5. Configurar Workspace y DataStore en GeoServer
Write-Host "`n[5/6] Configurando Workspace y DataStore en GeoServer..." -ForegroundColor Yellow

# Crear Workspace 'sig' si no existe
$wsCode = curl.exe -m 3 -s -o NUL -w "%{http_code}" -u $AUTH "$GS/workspaces/sig.json"
if ($wsCode -ne "200") {
    Write-Host "  -> Creando workspace 'sig'..." -ForegroundColor Cyan
    $null = curl.exe -m 3 -s -u $AUTH -X POST -H "Content-type: text/xml" -d "<workspace><name>sig</name></workspace>" "$GS/workspaces"
}

# Crear DataStore 'ign250' si no existe
$dsCode = curl.exe -m 3 -s -o NUL -w "%{http_code}" -u $AUTH "$GS/workspaces/sig/datastores/ign250.json"
if ($dsCode -ne "200") {
    Write-Host "  -> Creando conexión PostGIS 'ign250'..." -ForegroundColor Cyan
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
    $null = curl.exe -m 5 -s -u $AUTH -X POST -H "Content-type: text/xml" -d $storeXml "$GS/workspaces/sig/datastores"
}

# 6. Publicar capas vectoriales
Write-Host "`n[6/6] Verificando y publicando capas en GeoServer..." -ForegroundColor Yellow

$tablesRaw = docker exec sig_postgis psql -U postgres -d tpi -Atc "SELECT f_table_name FROM geometry_columns WHERE f_table_schema='ign250' ORDER BY f_table_name" 2>&1
$tables = ($tablesRaw -split "`r?`n") | Where-Object { $_.Trim() -ne "" }

$publishedCount = 0
foreach ($t in $tables) {
    $layerCode = curl.exe -m 3 -s -o NUL -w "%{http_code}" -u $AUTH "$GS/workspaces/sig/layers/$t.json"
    if ($layerCode -ne "200") {
        $featureXml = "<featureType><name>$t</name><srs>EPSG:4326</srs></featureType>"
        $pubCode = curl.exe -m 5 -s -o NUL -w "%{http_code}" -u $AUTH -X POST -H "Content-type: text/xml" -d $featureXml "$GS/workspaces/sig/datastores/ign250/featuretypes"
        if ($pubCode -eq "201") {
            $publishedCount++
            Write-Host "  [+] Publicada: $t" -ForegroundColor Green
        }
    }
}

if ($publishedCount -gt 0) {
    Write-Host "  -> Se publicaron $publishedCount nuevas capas." -ForegroundColor Green
} else {
    Write-Host "  -> Todas las capas ya se encontraban publicadas ($($tables.Count) capas en total)." -ForegroundColor Green
}

# Resumen Final
Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "   ¡ENTORNO SIG LISTO Y FUNCIONANDO CON ÉXITO!           " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "• GeoServer Web:     http://localhost:8081/geoserver  (admin / geoserver)"
Write-Host "• Layer Preview:     http://localhost:8081/geoserver/web/wicket/bookmarkable/org.geoserver.web.demo.MapPreviewPage"
Write-Host "• WMS Endpoint:      http://localhost:8081/geoserver/sig/wms"
Write-Host "• WFS Endpoint:      http://localhost:8081/geoserver/sig/wfs"
Write-Host "• PostgreSQL/PostGIS: localhost:5433 (user: postgres, pass: postgres, db: tpi)"
Write-Host "• pgAdmin 4 Web:     http://localhost:5050 (admin@sig.com / admin)"
Write-Host "==========================================================`n"
