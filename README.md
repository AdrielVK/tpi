# TP Integrador SIG: guía de puesta en marcha

Esta guía permite levantar el entorno completo (base espacial + servidor de mapas) en tu máquina después de clonar el repositorio.

## Qué se levanta

| Servicio | Contenedor | Para qué sirve | Puerto en tu máquina |
|---|---|---|---|
| PostgreSQL + PostGIS | `sig_postgis` | Base de datos espacial (`tpi`, esquema `ign250`) | `5433` |
| GeoServer | `sig_geoserver` | Servidor de mapas (WMS / WFS / WFS-T) | `8081` |
| pgAdmin web (opcional) | `sig_pgadmin` | Administración de la base | `5050` |

## Estructura del repositorio

```
tpi/
├── frontend/            App web (React + OpenLayers)
├── servidor/
│   ├── docker-compose.yml
│   ├── scripts/         cargar_capas.sh, crear_geoserver.sh
│   ├── estilos/         SLD de GeoServer
│   ├── capas/           (NO está en Git) manual del IGN y carpeta datos/
│   └── tpi.dump         (NO está en Git) respaldo de la base, se baja de Drive
└── README.md
```

---

## 1. Requisitos previos

- **Git**.
- **Docker Desktop** (Windows/Mac) o Docker Engine + plugin compose (Linux).
  - En Windows: Docker Desktop → *Settings → Resources → WSL Integration* → activar tu distribución.
  - Trabajá siempre desde la **terminal de WSL** (Ubuntu), no desde PowerShell.
- **QGIS** (para explorar datos y armar el mapa final).
- Opcional: **pgAdmin 4** de escritorio.

Verificá que Docker funciona:

```bash
docker --version
docker compose version
```

## 2. Clonar el repositorio

```bash
git clone <URL_DEL_REPO>
cd tpi
```

> Cloná dentro del sistema de archivos de WSL (por ejemplo `~/develop/tpi`), no en `/mnt/c/...`. Es mucho más rápido.

## 3. Descargar los archivos que no están en Git

Se bajan del Drive del equipo (pedir el link):

1. **`tpi.dump`** → guardarlo en `servidor/tpi.dump`.
2. **Capas del IGN** (solo si vas a recargar datos desde cero) → `servidor/capas/datos/`.

## 4. Verificar que los puertos estén libres

Se usan los puertos `5433`, `8081` y `5050`. Verificá en PowerShell (Windows):

```powershell
netstat -ano | findstr ":5433 :8081 :5050"
```

Si alguno está ocupado, cambiá **solo el número de la izquierda** en `servidor/docker-compose.yml` (por ejemplo `"5434:5432"`) y **avisá al equipo**, porque cambian las URLs de conexión.

## 5. Levantar los contenedores

```bash
cd servidor
docker compose up -d
docker compose ps
```

Esperá a que:

- `sig_postgis` figure como `Up`.
- `sig_geoserver` figure como `Up (healthy)`. **La primera vez tarda 1 a 3 minutos.**

Para seguir el arranque de GeoServer:

```bash
docker compose logs -f geoserver
```

Se sale con `Ctrl + C`. El arranque terminó cuando aparece `Server startup in [...] milliseconds`.

## 6. Restaurar la base de datos

Desde `servidor/`, con `tpi.dump` en esa carpeta:

```bash
docker exec sig_postgis psql -U postgres -d tpi -c "CREATE EXTENSION IF NOT EXISTS postgis;"
docker exec -i sig_postgis pg_restore -U postgres -d tpi --no-owner < tpi.dump
```

Pueden aparecer algunos avisos (`already exists`) sobre la extensión; no son un problema.

Verificá la restauración:

```bash
docker exec sig_postgis psql -U postgres -d tpi -c "SELECT count(*) FROM geometry_columns WHERE f_table_schema='ign250';"
```

Debe devolver **47** (o **48** si ya existe la tabla `observaciones`).

## 7. Recrear la configuración de GeoServer

El data directory de GeoServer es un volumen local de cada máquina, así que cada uno lo arma con el script del repo:

```bash
chmod +x scripts/crear_geoserver.sh
./scripts/crear_geoserver.sh
```

Cada línea de publicación debe devolver `HTTP 201`. El workspace y el store pueden devolver `HTTP 401` o `409` si ya existían; no es un problema.

Después de publicar las capas, cargá los estilos de las vías de comunicación (jerarquía de rutas y símbolos):

```bash
chmod +x scripts/estilos.sh
./scripts/estilos.sh
```

Debe devolver `HTTP 201` al crear cada estilo y `HTTP 200` al asignarlo. El script es idempotente (si el estilo ya existe, lo actualiza con `PUT`).

Entrá a la interfaz:

- URL: <http://localhost:8081/geoserver>
- Usuario: `admin`
- Contraseña: `geoserver`

Revisá en *Data → Layers* que estén las capas del workspace `sig`.

### Criterio de color de las vías de comunicación

**Clasificación.** La capa `red_vial` no distingue urbano/rural: la jerarquía se arma combinando `administra` × `tipo`. La red `Vecinal` es la red local (calles y caminos). Los cinco niveles de más a menos importante:

| Nivel | Filtro sobre `red_vial` | Grosor | Color | Casing |
|---|---|---|---|---|
| 1. Ruta nacional / internacional | `administra IN (Nacional, Internacional)` | 4.0 px (2x) | `#b3261e` | `#5c0f0a` |
| 2. Ruta provincial pavimentada | `Provincial` + `tipo LIKE '%Pavimentado%'` | 3.0 px (1.5x) | `#e07b27` | `#7d420c` |
| 3. Ruta provincial de tierra | `Provincial` + no pavimentado | 2.0 px (1x) | `#f0b95f` | `#92701f` |
| 4. Calle/camino local pavimentado | `Vecinal` + pavimentado | 2.0 px (1x) | `#f6dea6` | `#8f8260` |
| 5. Calle/camino local sin pavimentar | `Vecinal` + no pavimentado | 1.6 px (0.8x) | `#fbf2d8` | `#9a9384` |

Partición verificada: 8060 + 7678 + 9255 + 2744 + 91218 = 118955 features, sin solapamiento.

**Resto de vías.** `vias_secundarias` (huellas y senderos) usa otra familia, marrón/ocre, con la misma lógica: Huella/Rodera `#8d5a1e` (1x), Senda `#b07b33` (0.8x), Picada `#d3a86a` (0.6x, discontinua). `red_ferroviaria` usa el símbolo convencional (gris oscuro con trazos blancos); puentes, señalizaciones, marcas y salvado de obstáculo usan símbolos puntuales.

**Por qué esa gama.**
- El **Manual de signos cartográficos del IGN** (en `servidor/capas/`) define los signos 41–48 (autopista, camino pavimentado, consolidado, tierra, huella, senda, picada) y un sistema de color de reproducción **CMYK** para imprenta. No fija una paleta RGB para web.
- No existe una norma ISO que obligue a colores de rutas: los estándares son nacionales (IGN, USGS, Ordnance Survey) o de facto. El más documentado y abierto es **OSM Carto**, que usa exactamente una rampa cálida con casing: motorway `#e892a2`, trunk `#f9b29c`, primary `#fcd6a4`, secondary `#f7fabf`, residential `#ffffff` (casing `#bbb`).
- El criterio sigue las variables visuales de Bertin/Imhof: el **tono** identifica "esto es una vía" (cualitativo) y la **luminosidad** codifica la importancia (ordinal), de oscuro a claro. Los tonos cálidos contrastan con el fondo claro y con los accidentes fríos (agua, vegetación); el nivel más claro se mantiene legible por el casing gris.
- Referencias: `openstreetmap-carto/style/road-colors-generated.mss`; Manual IGN, signos 41–48.

**Nota de datos.** `vias_secundarias` casi no tiene features en Chaco (se concentran en Patagonia), así que es esperable no verlas en la vista provincial. La capa no trae atributo urbano/rural: "Vecinal" se usa para calles y caminos locales.

## 8. Probar que todo funciona

**Servicios OGC** (abrir en el navegador):

- WMS: <http://localhost:8081/geoserver/sig/wms?service=WMS&request=GetCapabilities>
- WFS: <http://localhost:8081/geoserver/sig/wfs?service=WFS&request=GetCapabilities>

**Vista previa:** en GeoServer, *Data → Layer Preview*, botón **OpenLayers** junto a `sig:red_vial` o `sig:provincias`.

**QGIS, conexión a la base:**
*Capa → Administrador de fuentes de datos → PostgreSQL → Nueva*

| Campo | Valor |
|---|---|
| Host | `localhost` |
| Puerto | `5433` |
| Base de datos | `tpi` |
| Usuario / contraseña | `postgres` / `postgres` |

**QGIS, conexión a los servicios:**
*Administrador de fuentes de datos → WMS/WMTS (o WFS) → Nueva*, URL `http://localhost:8081/geoserver/sig/wms` (o `/wfs`).

**pgAdmin de escritorio:** host `localhost`, puerto `5433`, base `tpi`, usuario y contraseña `postgres`.
**pgAdmin web (contenedor):** <http://localhost:5050> (`admin@sig.com` / `admin`), y al registrar el servidor usar host `postgis` y puerto `5432`.

---

## 9. Levantar la aplicación web (frontend)

La app está en `frontend/` (React + OpenLayers) y consume las capas del GeoServer. No tiene backend propio.
Requisitos: Node.js 18+ (probado con 22) y los contenedores del paso 5 levantados.

```bash
cd frontend
npm install
npm run dev
```

Abrí <http://localhost:5173>.

Funcionalidades (consigna a.3):

- Navegación del mapa (paneo, zoom, control de zoom y barra de escala).
- Activar/desactivar capas desde el panel izquierdo (catálogo agrupado con buscador).
- Leyenda por capa (`GetLegendGraphic`) y escala de visualización viva (1:N).
- Consulta gráfica por **punto** y por **rectángulo** sobre la capa elegida, con tabla de atributos y resaltado en el mapa.
- Medición de distancias (geodésica, en metros/kilómetros).
- Alta de nuevas observaciones por WFS-T en `ign250.observaciones` (se dibuja un punto y se completan los atributos).

Configuración opcional (variables de entorno al ejecutar `npm run dev`):

| Variable | Default | Uso |
|---|---|---|
| `VITE_GEOSERVER_URL` | `http://localhost:8081/geoserver` | URL base de GeoServer |
| `VITE_GEOSERVER_USER` | `admin` | Usuario para WFS-T (solo desarrollo) |
| `VITE_GEOSERVER_PASSWORD` | `geoserver` | Contraseña para WFS-T (solo desarrollo) |

> El alta por WFS-T exige autenticación porque GeoServer no permite escritura anónima. Son las credenciales de desarrollo del compose; no usarlas en un entorno real.

> CORS: el `docker-compose.yml` ya habilita `Authorization` en `CORS_ALLOWED_HEADERS` (necesario para el WFS-T desde el navegador). Si venías de un contenedor anterior, recreá GeoServer una vez: `docker compose up -d --force-recreate geoserver` (no borra datos).

Pruebas y build:

```bash
npm test        # tests de los helpers (Vitest)
npm run build   # build de producción en frontend/dist
```

> La leyenda se genera con GetLegendGraphic: las capas de vías de comunicación ya tienen SLD por clase, así que muestran su jerarquía real. El resto de las capas usa el estilo por defecto de GeoServer. La vista del mapa trabaja en EPSG:3857; los datos se consultan y escriben en EPSG:4326.

---

## Referencia rápida de conexiones

El host y el puerto dependen de **desde dónde** te conectás:

| Qué | Desde | Host | Puerto |
|---|---|---|---|
| Postgres | Tu máquina (QGIS, pgAdmin escritorio, psql, ogr2ogr) | `localhost` | `5433` |
| Postgres | Otro contenedor (GeoServer, pgAdmin web) | `postgis` | `5432` |
| GeoServer | Navegador, QGIS, app web | `localhost` | `8081` |

## Comandos del día a día

Siempre desde `servidor/`:

```bash
docker compose start             # retomar el trabajo
docker compose stop              # pausar sin perder datos
docker compose ps                # ver estado
docker compose logs -f geoserver # ver logs
```

> ⚠️ **Nunca usen `docker compose down -v`.** La opción `-v` borra los volúmenes: se pierde la base y la configuración de GeoServer. Si lo hacen sin querer, repitan los pasos 5 a 7.

## Generar un nuevo respaldo de la base

Cuando alguien agregue tablas o datos importantes (por ejemplo `observaciones` o resultados del análisis), generar un dump nuevo y compartirlo por Drive:

```bash
docker exec sig_postgis pg_dump -U postgres -Fc -n ign250 tpi > servidor/tpi.dump
```

Si cambian los scripts SQL, guardarlos en `servidor/sql/` y subirlos a Git.

## Problemas frecuentes

**GeoServer da 404 en `localhost:8081/geoserver`.**
Todavía está arrancando. Esperá y revisá `docker compose logs geoserver`. Verificá en `docker compose ps` que el puerto figure como `0.0.0.0:8081->8080/tcp`.

**Los scripts devuelven `HTTP 404` en todas las líneas.**
Otro programa ocupa el puerto o la URL está mal. Probá `curl -u admin:geoserver http://localhost:8081/geoserver/rest/about/version.json`.

**pgAdmin de escritorio no conecta.**
Usá host `localhost` y puerto `5433` (no `postgis`). Si aparece un error raro como `'ServerManager' has no attribute user_info`, cerrá pgAdmin por completo (también desde la bandeja del sistema) y volvelo a abrir.

**`password authentication failed` o la base no es la esperada.**
Puede haber un PostgreSQL instalado en Windows usando el puerto. Cambiá el mapeo del compose a otro puerto libre.

**`pg_restore` falla con "extension postgis does not exist".**
Ejecutá primero el `CREATE EXTENSION IF NOT EXISTS postgis;` del paso 6.

**Las tablas ya existen al restaurar.**
Si la base ya tiene datos, restaurá con limpieza previa:

```bash
docker exec -i sig_postgis pg_restore -U postgres -d tpi --no-owner --clean --if-exists < tpi.dump
```

**El store de GeoServer no lista tablas.**
Revisá en *Data → Stores → ign250* que `schema` sea `ign250`, `database` sea `tpi`, `host` sea `postgis` y `port` sea `5432`.

## Credenciales de desarrollo

Estas credenciales son solo para el entorno local del TP. No usarlas en un entorno real.

| Servicio | Usuario | Contraseña |
|---|---|---|
| PostgreSQL | `postgres` | `postgres` |
| GeoServer | `admin` | `geoserver` |
| pgAdmin web | `admin@sig.com` | `admin` |

## Estado del trabajo y pendientes

- [x] Entorno Docker (PostGIS, GeoServer, pgAdmin)
- [x] Carga de las capas del IGN en PostGIS (esquema `ign250`)
- [x] Publicación de las capas en GeoServer (WMS / WFS)
- [x] Estilos SLD de vías de comunicación en `servidor/estilos/` (el resto de las capas usa el estilo por defecto)
- [x] Capa editable `observaciones` publicada con WFS-T
- [ ] Análisis de la RN11 (longitud, buffers de 10 y 20 km, población, puentes)
- [x] Aplicación web en `frontend/` (visualización, capas, leyenda, consultas, medición y alta WFS-T)
- [ ] Informe (consigna b)
- [ ] Mapa A4 en PDF (consigna c)
