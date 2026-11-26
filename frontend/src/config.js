/**
 * Configuracion de la app y catalogo de capas del SIG IGN 250.
 * El origen de datos es el GeoServer del TP (docker-compose del repo).
 */

const rawUrl = import.meta.env.VITE_GEOSERVER_URL ?? 'http://localhost:8081/geoserver';

/** URL base de GeoServer, sin barra final. */
export const GEOSERVER_URL = String(rawUrl).replace(/\/$/, '');
export const WORKSPACE = 'sig';
/** Namespace XML de las features del workspace (confirmado por DescribeFeatureType). */
export const FEATURE_NS = 'http://sig.local';
/** Capa vectorial creada a tal fin para el alta de features (WFS-T). */
export const INSERT_LAYER = 'observaciones';
/** Escala nominal de las capas del SIG IGN 250. */
export const NOMINAL_SCALE = '1:250.000';
/** Centro y zoom iniciales (Provincia del Chaco). */
export const CHACO_CENTER = [-59.2, -26.9];
export const CHACO_ZOOM = 7;

export const WMS_URL = `${GEOSERVER_URL}/${WORKSPACE}/wms`;
export const WFS_URL = `${GEOSERVER_URL}/${WORKSPACE}/wfs`;

/**
 * Credenciales de DESARROLLO para WFS-T (GeoServer exige autenticacion para
 * escribir). Son las mismas del docker-compose del TP y se pueden sobreescribir
 * con VITE_GEOSERVER_USER / VITE_GEOSERVER_PASSWORD. No usar en produccion.
 */
export const GEOSERVER_USER = import.meta.env.VITE_GEOSERVER_USER ?? 'admin';
export const GEOSERVER_PASSWORD = import.meta.env.VITE_GEOSERVER_PASSWORD ?? 'geoserver';

export function geoserverAuthHeader() {
  return `Basic ${btoa(`${GEOSERVER_USER}:${GEOSERVER_PASSWORD}`)}`;
}

/** URL de GetLegendGraphic para la leyenda de una capa. */
export function legendUrl(layerId) {
  return `${WMS_URL}?service=WMS&version=1.1.1&request=GetLegendGraphic&format=image/png&layer=${WORKSPACE}:${encodeURIComponent(layerId)}`;
}

/**
 * Catalogo de capas. `group` define el agrupamiento del panel izquierdo.
 * `visible` indica las capas encendidas al iniciar.
 */
export const LAYERS = [
  { id: 'provincias', label: 'Provincias', group: 'Limites y administracion', visible: true },
  { id: 'pais_lim', label: 'Pais (limite)', group: 'Limites y administracion' },
  { id: 'limite_politico_administrativo_lim', label: 'Limite politico administrativo', group: 'Limites y administracion' },
  { id: 'ejido', label: 'Ejido', group: 'Limites y administracion' },
  { id: 'isla', label: 'Isla', group: 'Limites y administracion' },

  { id: 'red_vial', label: 'Red vial', group: 'Vias de comunicacion', visible: true },
  { id: 'vias_secundarias', label: 'Vias secundarias', group: 'Vias de comunicacion' },
  { id: 'red_ferroviaria', label: 'Red ferroviaria', group: 'Vias de comunicacion' },
  { id: 'puente_red_vial_puntos', label: 'Puentes de la red vial', group: 'Vias de comunicacion' },
  { id: 'salvado_de_obstaculo', label: 'Salvado de obstaculo', group: 'Vias de comunicacion' },
  { id: 'marcas_y_senales', label: 'Marcas y senales', group: 'Vias de comunicacion' },
  { id: 'senalizaciones', label: 'Senalizaciones', group: 'Vias de comunicacion' },

  { id: 'localidades', label: 'Localidades', group: 'Poblacion', visible: true },

  { id: 'curso_de_agua_hid', label: 'Cursos de agua', group: 'Hidrografia' },
  { id: 'espejo_de_agua_hid', label: 'Espejos de agua', group: 'Hidrografia' },
  { id: 'infraestructura_hidro', label: 'Infraestructura hidrica', group: 'Hidrografia' },
  { id: 'muro_embalse', label: 'Muro de embalse', group: 'Hidrografia' },

  { id: 'curvas_de_nivel', label: 'Curvas de nivel', group: 'Relieve' },
  { id: 'puntos_de_alturas_topograficas', label: 'Puntos de alturas topograficas', group: 'Relieve' },
  { id: 'puntos_del_terreno', label: 'Puntos del terreno', group: 'Relieve' },

  { id: 'sue_costero', label: 'Suelo costero', group: 'Suelos' },
  { id: 'sue_hidromorfologico', label: 'Suelo hidromorfologico', group: 'Suelos' },
  { id: 'sue_no_consolidado', label: 'Suelo no consolidado', group: 'Suelos' },
  { id: 'sue_congelado', label: 'Suelo congelado', group: 'Suelos' },
  { id: 'sue_consolidado', label: 'Suelo consolidado', group: 'Suelos' },

  { id: 'veg_arborea', label: 'Vegetacion arborea', group: 'Vegetacion' },
  { id: 'veg_arbustiva', label: 'Vegetacion arbustiva', group: 'Vegetacion' },
  { id: 'veg_cultivos', label: 'Vegetacion cultivos', group: 'Vegetacion' },
  { id: 'veg_hidrofila', label: 'Vegetacion hidrofila', group: 'Vegetacion' },
  { id: 'veg_suelo_desnudo', label: 'Vegetacion suelo desnudo', group: 'Vegetacion' },

  { id: 'edif_construcciones_turisticas', label: 'Construcciones turisticas', group: 'Edificaciones' },
  { id: 'edif_depor_y_esparcimiento', label: 'Edificios de deporte y esparcimiento', group: 'Edificaciones' },
  { id: 'edif_educacion', label: 'Edificios de educacion', group: 'Edificaciones' },
  { id: 'edif_religiosos', label: 'Edificios religiosos', group: 'Edificaciones' },
  { id: 'edificio_de_salud_ips', label: 'Edificio de salud (IPS)', group: 'Edificaciones' },
  { id: 'edificio_de_seguridad_ips', label: 'Edificio de seguridad (IPS)', group: 'Edificaciones' },
  { id: 'edificio_publico_ips', label: 'Edificio publico (IPS)', group: 'Edificaciones' },
  { id: 'edificios_ferroviarios', label: 'Edificios ferroviarios', group: 'Edificaciones' },
  { id: 'otras_edificaciones', label: 'Otras edificaciones', group: 'Edificaciones' },

  { id: 'complejo_de_energia_ene', label: 'Complejo de energia', group: 'Energia' },
  { id: 'lineas_de_conduccion_ene', label: 'Lineas de conduccion', group: 'Energia' },

  { id: 'actividades_agropecuarias', label: 'Actividades agropecuarias', group: 'Actividades economicas' },
  { id: 'actividades_economicas', label: 'Actividades economicas', group: 'Actividades economicas' },

  { id: 'estructuras_portuarias', label: 'Estructuras portuarias', group: 'Infraestructura' },
  { id: 'obra_portuaria', label: 'Obra portuaria', group: 'Infraestructura' },
  { id: 'obra_de_comunicacion', label: 'Obra de comunicacion', group: 'Infraestructura' },
  { id: 'infraestructura_aeroportuaria_punto', label: 'Infraestructura aeroportuaria', group: 'Infraestructura' },

  { id: 'observaciones', label: 'Observaciones (capa editable)', group: 'Capa editable' },
];

/** Estado inicial de visibilidad de capas. */
export const INITIAL_VISIBILITY = Object.fromEntries(
  LAYERS.map((layer) => [layer.id, Boolean(layer.visible)]),
);

// ---------------------------------------------------------------------------
// Subfiltros de las redes viales (se aplican por CQL_FILTER en WMS y WFS)
// ---------------------------------------------------------------------------

const PAVED_TYPES =
  "'Camino Pavimentado','Autopista con Camino Pavimentado Dual con Separador'";
const UNPAVED_TYPES =
  "'Camino Consolidado, Camino sin Pavimentar de Transitavilidad Permanente','Camino de Tierra, Camino sin Pavimentar de Transitavilidad Temporaria'";

/** Componentes de red_vial (mismos 5 niveles que el SLD de jerarquia). */
export const ROAD_CLASSES = [
  {
    id: 'nacional',
    label: 'Rutas nacionales e internacionales',
    cql: "administra IN ('Nacional','Internacional')",
  },
  {
    id: 'provincial_pavimentada',
    label: 'Rutas provinciales pavimentadas',
    cql: `administra='Provincial' AND tipo IN (${PAVED_TYPES})`,
  },
  {
    id: 'provincial_tierra',
    label: 'Rutas provinciales de tierra',
    cql: `administra='Provincial' AND tipo IN (${UNPAVED_TYPES})`,
  },
  {
    id: 'local_pavimentada',
    label: 'Calles/caminos locales pavimentados',
    cql: `administra='Vecinal' AND tipo IN (${PAVED_TYPES})`,
  },
  {
    id: 'local_tierra',
    label: 'Calles/caminos locales sin pavimentar',
    cql: `administra='Vecinal' AND tipo IN (${UNPAVED_TYPES})`,
  },
];

/** Presets rapidos para red_vial: null = todas las clases. */
export const ROAD_PRESETS = [
  { id: 'todas', label: 'Todas', classes: null },
  { id: 'rutas', label: 'Solo rutas', classes: ['nacional', 'provincial_pavimentada', 'provincial_tierra'] },
  { id: 'locales', label: 'Solo locales', classes: ['local_pavimentada', 'local_tierra'] },
];

/** Componentes de vias_secundarias. */
export const SECONDARY_CLASSES = [
  { id: 'huella', label: 'Huella / rodera', cql: "tipo='Huella, Rodera'" },
  { id: 'senda', label: 'Senda / camino de herradura', cql: "tipo='Senda, Camino de Herradura'" },
  { id: 'picada', label: 'Picada / contrafuego', cql: "tipo='Picada, Contrafuego'" },
];

export const SECONDARY_PRESETS = [
  { id: 'todas', label: 'Todas', classes: null },
  { id: 'huellas', label: 'Solo huellas', classes: ['huella'] },
  { id: 'senderos', label: 'Solo senderos', classes: ['senda', 'picada'] },
];

export const DEFAULT_ROAD_ACTIVE = ROAD_CLASSES.map((entry) => entry.id);
export const DEFAULT_SECONDARY_ACTIVE = SECONDARY_CLASSES.map((entry) => entry.id);

