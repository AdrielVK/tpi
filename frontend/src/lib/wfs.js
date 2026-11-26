/**
 * Construccion y parseo de pedidos WFS/WFS-T contra GeoServer.
 * Los builders son puros (sin DOM ni fetch) para poder testearlos en Node.
 */

/** Escapa texto para incluirlo dentro de un documento XML. */
export function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const round6 = (value) => Math.round(value * 1e6) / 1e6;

/**
 * URL de WFS GetFeature (v1.1.0, GeoJSON, EPSG:4326).
 * mode = 'bbox' consulta el extent4326 dibujado.
 * mode = 'point' arma un bbox de tolerancia alrededor de point4326 (identify).
 * cqlFilter permite combinar un subfiltro de clases con el area.
 *
 * Nota: el area se expresa como BBOX en CQL y no con el parametro `bbox`
 * porque GeoServer los considera mutuamente excluyentes. En WFS 1.1.0 con
 * EPSG:4326 los filtros CQL usan orden de ejes lat,lon.
 */
export function buildGetFeatureUrl({
  baseUrl,
  workspace = 'sig',
  layer,
  mode,
  extent4326,
  point4326,
  toleranceDegrees = 0.005,
  cqlFilter = '',
  maxFeatures = 100,
}) {
  const url = new URL(`${baseUrl.replace(/\/$/, '')}/${workspace}/wfs`);
  url.searchParams.set('service', 'WFS');
  url.searchParams.set('version', '1.1.0');
  url.searchParams.set('request', 'GetFeature');
  url.searchParams.set('typeName', `${workspace}:${layer}`);
  url.searchParams.set('srsName', 'EPSG:4326');
  url.searchParams.set('outputFormat', 'application/json');
  url.searchParams.set('maxFeatures', String(maxFeatures));

  let box = null;
  if (mode === 'bbox' && Array.isArray(extent4326)) {
    box = extent4326;
  } else if (mode === 'point' && Array.isArray(point4326)) {
    const [lon, lat] = point4326;
    const tol = Number.isFinite(toleranceDegrees) && toleranceDegrees > 0 ? toleranceDegrees : 0.005;
    box = [lon - tol, lat - tol, lon + tol, lat + tol];
  }

  if (box) {
    const [minx, miny, maxx, maxy] = box.map(round6);
    const spatial = `BBOX(geom,${miny},${minx},${maxy},${maxx})`;
    const parts = [spatial];
    if (cqlFilter && cqlFilter !== '1=1') parts.push(`(${cqlFilter})`);
    url.searchParams.set('CQL_FILTER', parts.join(' AND '));
  }

  // GeoServer decodifica "+" como espacio igual que %20; forzamos %20.
  return url.toString().replace(/\+/g, '%20');
}

/** XML de un WFS-T Transaction/Insert para una capa vectorial. */
export function buildInsertXml({
  workspace = 'sig',
  namespace,
  layer = 'observaciones',
  properties,
  lon,
  lat,
}) {
  const fields = Object.entries(properties ?? {})
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')
    .map(([key, value]) => `      <${workspace}:${key}>${escapeXml(String(value).trim())}</${workspace}:${key}>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<wfs:Transaction service="WFS" version="1.1.0"
  xmlns:wfs="http://www.opengis.net/wfs"
  xmlns:${workspace}="${escapeXml(namespace)}"
  xmlns:gml="http://www.opengis.net/gml">
  <wfs:Insert>
    <${workspace}:${layer}>
${fields}
      <${workspace}:geom><gml:Point srsName="EPSG:4326"><gml:pos>${lon} ${lat}</gml:pos></gml:Point></${workspace}:geom>
    </${workspace}:${layer}>
  </wfs:Insert>
</wfs:Transaction>`;
}

/** Extrae los totales de un TransactionResponse de WFS-T. Null si no es un exito. */
export function parseTransactionSummary(xml) {
  const section = String(xml ?? '').match(/<wfs:TransactionSummary>([\s\S]*?)<\/wfs:TransactionSummary>/);
  if (!section) return null;
  const read = (name) => {
    const match = section[1].match(new RegExp(`<wfs:${name}>(\\d+)</wfs:${name}>`));
    return match ? Number(match[1]) : 0;
  };
  return {
    inserted: read('totalInserted'),
    updated: read('totalUpdated'),
    deleted: read('totalDeleted'),
  };
}
