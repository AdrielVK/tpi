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
 */
export function buildGetFeatureUrl({
  baseUrl,
  workspace = 'sig',
  layer,
  mode,
  extent4326,
  point4326,
  toleranceDegrees = 0.005,
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

  if (mode === 'bbox' && Array.isArray(extent4326)) {
    const [minx, miny, maxx, maxy] = extent4326.map(round6);
    url.searchParams.set('bbox', `${minx},${miny},${maxx},${maxy},EPSG:4326`);
  } else if (mode === 'point' && Array.isArray(point4326)) {
    const [lon, lat] = point4326;
    const tol = Number.isFinite(toleranceDegrees) && toleranceDegrees > 0 ? toleranceDegrees : 0.005;
    url.searchParams.set(
      'bbox',
      `${round6(lon - tol)},${round6(lat - tol)},${round6(lon + tol)},${round6(lat + tol)},EPSG:4326`,
    );
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
