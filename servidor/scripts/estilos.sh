#!/bin/bash
# ==============================================================================
# Publica los SLD de servidor/estilos/ en GeoServer y los asigna como estilo
# por defecto a cada capa de vias de comunicacion.
# Requiere los contenedores levantados. Se puede correr desde cualquier carpeta.
# ==============================================================================
set -u

GS="http://localhost:8081/geoserver/rest"
AUTH="admin:geoserver"
WS="sig"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ESTILOS_DIR="$(cd "$SCRIPT_DIR/../estilos" && pwd)"

publish() {
  local style="$1" file="$2" code
  code=$(curl -s -o /dev/null -w "%{http_code}" -u "$AUTH" -X POST \
    -H "Content-Type: application/vnd.ogc.sld+xml" \
    --data-binary @"$ESTILOS_DIR/$file" \
    "$GS/workspaces/$WS/styles?name=$style")
  if [ "$code" != "201" ]; then
    code=$(curl -s -o /dev/null -w "%{http_code}" -u "$AUTH" -X PUT \
      -H "Content-Type: application/vnd.ogc.sld+xml" \
      --data-binary @"$ESTILOS_DIR/$file" \
      "$GS/workspaces/$WS/styles/$style")
  fi
  printf "  [estilo] %-34s HTTP %s\n" "$style" "$code"
}

assign() {
  local layer="$1" style="$2" code
  code=$(curl -s -o /dev/null -w "%{http_code}" -u "$AUTH" -X PUT \
    -H "Content-Type: text/xml" \
    -d "<layer><defaultStyle><name>$style</name></defaultStyle></layer>" \
    "$GS/workspaces/$WS/layers/$layer")
  printf "  [capa]   %-34s -> %-32s HTTP %s\n" "$layer" "$style" "$code"
}

echo "== Publicando estilos en el workspace '$WS'"
publish red_vial_jerarquia            red_vial_jerarquia.sld
publish vias_secundarias_jerarquia    vias_secundarias_jerarquia.sld
publish red_ferroviaria_convencional  red_ferroviaria.sld
publish puente_red_vial_puntos        puentes.sld
publish senalizaciones                senalizaciones.sld
publish marcas_y_senales              marcas_y_senales.sld
publish salvado_de_obstaculo          salvado_de_obstaculo.sld

echo "== Asignando estilo por defecto a cada capa"
assign red_vial               red_vial_jerarquia
assign vias_secundarias       vias_secundarias_jerarquia
assign red_ferroviaria        red_ferroviaria_convencional
assign puente_red_vial_puntos puente_red_vial_puntos
assign senalizaciones         senalizaciones
assign marcas_y_senales       marcas_y_senales
assign salvado_de_obstaculo   salvado_de_obstaculo

echo "== Listo. Verificar en Data -> Layers de GeoServer o por GetLegendGraphic."
