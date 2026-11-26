/**
 * Combinacion de subfiltros CQL.
 * Se usan expresiones CQL porque GeoServer acepta CQL_FILTER tanto en WMS
 * (render) como en WFS (consultas), manteniendo mapa y consultas coherentes.
 */

/**
 * Devuelve la expresion CQL de las clases activas.
 * - Sin clases activas: "1=0" (nada).
 * - Todas activas: "1=1" (sin filtro).
 * - Parcial: cada clase entre parentesis, unidas con OR.
 */
export function combineCql(classes, activeIds) {
  const active = classes.filter((entry) => activeIds.includes(entry.id));
  if (active.length === 0) return '1=0';
  if (active.length === classes.length) return '1=1';
  return active.map((entry) => `(${entry.cql})`).join(' OR ');
}
