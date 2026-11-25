/**
 * Helpers puros de formato y calculo. Sin dependencias de OpenLayers ni del DOM,
 * para poder testearlos en Node.
 */

/** Formatea una distancia en metros: "950 m" o "1.53 km". */
export function formatDistance(meters) {
  if (!Number.isFinite(meters) || meters < 0) return '0 m';
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
  return `${Math.round(meters)} m`;
}

/** Formatea un denominador de escala: 10000 -> "1:10.000". */
export function formatScale(denominator) {
  const rounded = Math.round(Number.isFinite(denominator) ? denominator : 0);
  return `1:${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(rounded)}`;
}

/**
 * Denominador de escala a partir de la resolucion del mapa (unidades de mapa por
 * pixel) y los DPI de pantalla. Formula: res * dpi / 0.0254.
 */
export function scaleDenominator(resolution, dpi = 96) {
  if (!Number.isFinite(resolution) || resolution <= 0) return 0;
  return (resolution * dpi) / 0.0254;
}

/** Resume las propiedades de una feature para mostrarlas en una tabla. */
export function summarizeProperties(properties, max = 8) {
  const out = [];
  for (const [key, value] of Object.entries(properties ?? {})) {
    if (key === 'geometry' || value === null || value === undefined) continue;
    const text = String(value).trim();
    if (!text) continue;
    out.push({ key, value: text });
    if (out.length >= max) break;
  }
  return out;
}
