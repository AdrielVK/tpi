# Feature: Aplicación web SIG (consigna a.3)

Objetivo: app web React + OpenLayers que consume los servicios WMS/WFS de GeoServer para visualizar las capas del SIG IGN 250 y cubrir las funcionalidades mínimas de la consigna a.3.
Rama: `feat/frontend-sig-app` (parte de `main` en `65c19c8`). Entrega por work-unit commits; push/PR queda a decisión del usuario.
Test runner: `npm test` (Vitest, helpers puros) + `npm run build` + smoke WFS contra GeoServer.

## Specs

- **S1** — Navegación del mapa: "Navegación del mapa (paneo, zoom, etc.)". Criterio: mapa con base OSM, paneo con arrastre, zoom con rueda y control de zoom; vista centrada en la Provincia del Chaco.
- **S2** — "Activar/Desactivar capas". Criterio: panel izquierdo con el catálogo de capas agrupado por tema, checkbox por capa que muestra/oculta la capa WMS; buscador y acciones "todas/nada".
- **S3** — "Mostrar la leyenda de las capas (Clases de la simbología), y escala de visualización." Criterio: leyenda por capa vía `GetLegendGraphic` de GeoServer, escala nominal de la capa (1:250.000) y escala de visualización viva del mapa (1:N + barra gráfica).
- **S4** — "Consulta gráfica (punto y rectangulo) para cada capa". Criterio: elegir capa objetivo, dibujar un punto o un rectángulo sobre el mapa y ver la tabla de atributos de las features intersectadas (WFS GetFeature), con resaltado en el mapa; aviso cuando no hay resultados.
- **S5** — "Medición de distancias". Criterio: dibujar una línea y obtener la longitud geodésica en metros/km; lista acumulable de mediciones con opción de limpiar.
- **S6** — "Ingresar nuevos elementos (features) en una capa vectorial (geometría y atributos). Dicha capa puede ser una creada a tal fin, o una de las del SIG250." Criterio: dibujar un punto sobre el mapa, completar atributos (nombre, categoría, descripción) y persistirlo por WFS-T en `ign250.observaciones` (tabla creada a tal fin); validación y mensaje de éxito/error; la capa se refresca.
- **S7** — "Desarrollar una aplicación web para visualizar las capas montadas en el servidor de mapas que disponga, como mínimo, de las siguientes funcionalidades". Criterio: app servida por Vite (`npm run dev`), sin backend propio, consumiendo GeoServer.
- **S8** (supuesto) — Origen de datos: `http://localhost:8081/geoserver`, workspace `sig`, capa editable `observaciones`, namespace de features `http://sig.local`. Sobreescribible con `VITE_GEOSERVER_URL`. Verificado por REST y por WFS-T (insert + delete).
- **S9** (supuesto) — Mapa base: OpenStreetMap. Vista en EPSG:3857; los datos se piden en EPSG:4326 y se reproyectan en el cliente.

## Tasks

- [x] **T1** Scaffold Vite + React + OpenLayers y mapa base con capas WMS. Specs: S1, S7, S8 — route: inline — commit: c66b7d1, 8b569f5
- [x] **T2** Catálogo de capas + activar/desactivar + buscador. Specs: S2 — route: inline — commit: 8b569f5
- [x] **T3** Panel de leyenda (GetLegendGraphic), escala nominal y escala viva. Specs: S3 — route: inline — commit: 8b569f5
- [x] **T4** Consulta gráfica punto/rectángulo por capa con tabla de resultados y resaltado. Specs: S4 — route: inline — commit: c66b7d1, 8b569f5
- [x] **T5** Medición de distancias con lista y limpieza. Specs: S5 — route: inline — commit: 8b569f5
- [x] **T6** Alta de observaciones por WFS-T con formulario y refresco de capa. Specs: S6 — route: inline — commit: ed7f2d6, c66b7d1, 8b569f5
- [x] **T7** Build, smoke WFS, documentación en README. Specs: S7 — route: inline — commit: este commit de docs

## Log

- **L1 (pedido original, verbatim)** — "releva el contexto del proyecto. tengo q hacer un sistema de informacion geografico: tengo la base de datos en postgis de postgres, cargue capas y geoserver de servidor para luego construir la app web frontend." + Consigna a.3: "Desarrollar una aplicación web para visualizar las capas montadas en el servidor de mapas que disponga, como mínimo, de las siguientes funcionalidades: l Navegación del mapa (paneo, zoom, etc.) l Activar/Desactivar capas l Mostrar la leyenda de las capas (Clases de la simbología), y escala de visualización. l Consulta gráfica (punto y rectangulo) para cada capa l Medición de distancias l Ingresar nuevos elementos (features) en una capa vectorial (geometría y atributos). Dicha capa puede ser una creada a tal fin, o una de las del SIG250." + "Dale, arranca en la carpeta correcta".
- **L2 (evidencia de entorno)** — Entorno levantado: PostGIS 3.4 con 48 tablas geométricas en `ign250`; GeoServer 2.26.1 con workspace `sig`, store `ign250`, 48 capas publicadas; WMS/WFS devuelven 200; CORS `Access-Control-Allow-Origin: *`; WFS con `Transactional` habilitado.
- **L3 (evidencia WFS-T)** — Insert y delete de prueba contra `sig:observaciones` por WFS-T: `totalInserted=1` y `totalDeleted=1`; la tabla quedó en 0 filas. Namespace de features confirmado `http://sig.local` (DescribeFeatureType).
- **L4 (alcance de estilos)** — Los SLD por clase siguen siendo el pendiente "Estilos SLD" del README. La leyenda se implementa de forma genérica vía GetLegendGraphic, de modo que refleje automáticamente los estilos cuando se carguen.
- **L5 (TDD de helpers)** — Tests escritos primero (RED: módulos inexistentes). Luego `geo.js` y `wfs.js` (GREEN): 13 tests pasando (`npm test`).
- **L6 (hallazgo CORS + autenticación)** — El POST WFS-T anónimo devuelve `{http://sig.local}observaciones is read-only`. El alta requiere Basic auth (admin:geoserver). Además el preflight OPTIONS con `Authorization` daba 403 porque `CORS_ALLOWED_HEADERS` no incluía `authorization`. Fix en `servidor/docker-compose.yml` (ed7f2d6) + recreación del contenedor (`--force-recreate geoserver`, sin tocar datos). Preflight ahora 200 con `Access-Control-Allow-Headers: ...authorization...`.
- **L7 (hallazgo consulta por punto)** — `INTERSECTS(geom, POINT(...))` devolvía 0 resultados por ser una intersección exacta. Se cambió a un bbox de tolerancia de "identify" (~4 px según resolución, mínimo 25 m) calculado en `MapView`. Verificado contra `localidades` en Resistencia: 1 feature (nombre = Resistencia).
- **L8 (bug de runtime detectado con headless)** — Importar `Map` de `ol/Map` sombreaba el `Map` nativo de JS y rompía el registro de capas WMS (`wmsRef.current is not iterable`). Se renombró a `OlMap`. Render headless con Chromium: app montada, canvas presente, sin errores de consola.
- **L9 (evidencia de verificación)** — `npm test`: 13/13. `npm run build`: OK (533 kB, warning de tamaño de chunk). Smoke con los builders reales contra GeoServer: rectángulo `red_vial` 5 features; punto `localidades` 1 feature; insert WFS-T autenticado `{"inserted":1}`. Filas de prueba borradas (`observaciones` quedó en 0).
- **L10 (pendiente/asunción)** — Credenciales dev (`admin/geoserver`) viajan en el bundle del navegador; aceptable para el TP local y documentado en el README. Para producción haría falta un proxy con credenciales.
