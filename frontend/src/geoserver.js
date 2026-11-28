import Feature from 'ol/Feature.js'
import Point from 'ol/geom/Point.js'
import { toLonLat } from 'ol/proj.js'

export const WMS_URL = '/geoserver/sig/wms'
const WFS_URL = '/geoserver/sig/wfs'
export const OBSERVATIONS = 'sig:observaciones'
export const MAP_PROJECTION = 'EPSG:3857'
export const FEATURE_LIMIT = 100

const mainLayers = new Map([
  ['red_vial', ['Red vial', '#3759ad']],
  ['provincias', ['Límites provinciales', '#58765a']],
  ['localidades', ['Localidades', '#80538a']],
  ['curso_de_agua_hid', ['Cursos de agua', '#327c97']],
  ['puente_red_vial_puntos', ['Puentes de la red vial', '#a16b29']],
  ['observaciones', ['Observaciones', '#be5630']],
])

export const initialLayers = ['sig:provincias', 'sig:red_vial']

function urlWithParams(url, params) {
  return `${url}?${new URLSearchParams(params)}`
}

function nodes(element, name) {
  return [...element.getElementsByTagNameNS('*', name)]
}

function childText(element, name) {
  return [...element.children].find((child) => child.localName === name)?.textContent.trim()
}

async function request(url, options) {
  const response = await fetch(url, options)
  if (!response.ok) throw new Error(`GeoServer respondió con HTTP ${response.status}.`)
  return response
}

async function readXml(url, options) {
  const response = await request(url, options)
  const xml = new DOMParser().parseFromString(await response.text(), 'application/xml')
  const error = nodes(xml, 'ExceptionText')[0] ?? nodes(xml, 'ServiceException')[0]
  if (error || nodes(xml, 'parsererror').length) {
    throw new Error(error?.textContent.trim() || 'GeoServer devolvió un XML inválido.')
  }
  return xml
}

export async function getCatalog(signal) {
  const [wms, wfs] = await Promise.allSettled([
    readXml(urlWithParams(WMS_URL, { service: 'WMS', version: '1.3.0', request: 'GetCapabilities' }), { signal }),
    readXml(urlWithParams(WFS_URL, { service: 'WFS', version: '2.0.0', request: 'GetCapabilities' }), { signal }),
  ])

  if (wms.status === 'rejected') throw wms.reason
  const advertised = wfs.status === 'fulfilled' ? wfs.value : null
  const wfsLayers = new Set(advertised ? nodes(advertised, 'FeatureType').map((layer) => childText(layer, 'Name')) : [])
  const layers = nodes(wms.value, 'Layer').flatMap((layer) => {
    const name = childText(layer, 'Name')
    if (!name) return []
    const shortName = name.split(':').at(-1)
    const id = name.includes(':') ? name : `sig:${name}`
    const [label, color] = mainLayers.get(shortName) ?? [null, '#5d776d']
    const rawTitle = (childText(layer, 'Title') || shortName).replaceAll('_', ' ')
    const title = label ?? (rawTitle[0].toLocaleUpperCase('es') + rawTitle.slice(1))
    return [{ id, shortName, title, color, queryable: ['1', 'true'].includes(layer.getAttribute('queryable')), wfs: wfsLayers.has(id) }]
  })
  if (!layers.length) throw new Error('El espacio sig no anunció capas WMS.')

  const preferred = [...mainLayers.keys()]
  const order = (name) => preferred.includes(name) ? preferred.indexOf(name) : preferred.length
  layers.sort((a, b) => order(a.shortName) - order(b.shortName) || a.title.localeCompare(b.title, 'es'))
  return {
    layers,
    wfsAvailable: Boolean(advertised),
    canInsert: Boolean(wfsLayers.has(OBSERVATIONS) && advertised && nodes(advertised, 'Operation')
      .some((operation) => operation.getAttribute('name') === 'Transaction')),
  }
}

export function legendUrl(layerId) {
  return urlWithParams(WMS_URL, {
    service: 'WMS', version: '1.0.0', request: 'GetLegendGraphic', format: 'image/png', layer: layerId,
    legend_options: 'forceLabels:on;fontName:SansSerif;fontSize:15;fontColor:0x18362E;bgColor:0xFFFFFF',
  })
}

async function readFeatures(url, signal) {
  const response = await request(url, { signal })
  const collection = await response.json().catch(() => null)
  if (collection?.type !== 'FeatureCollection' || !Array.isArray(collection.features)) {
    throw new Error('GeoServer no devolvió una colección de entidades.')
  }
  return collection
}

export function queryPoint(source, coordinate, resolution, projection, signal) {
  const url = source.getFeatureInfoUrl(coordinate, resolution, projection, {
    INFO_FORMAT: 'application/json', FEATURE_COUNT: FEATURE_LIMIT, BUFFER: 7,
  })
  if (!url) throw new Error('No se puede consultar en esta escala.')
  return readFeatures(url, signal)
}

export function queryExtent(layerId, extent, signal) {
  return readFeatures(urlWithParams(WFS_URL, {
    service: 'WFS', version: '2.0.0', request: 'GetFeature', typeNames: layerId,
    outputFormat: 'application/json', srsName: MAP_PROJECTION, count: FEATURE_LIMIT,
    bbox: `${extent.join(',')},${MAP_PROJECTION}`,
  }), signal)
}

export async function insertObservation(coordinate, { name, category, description }) {
  const [{ default: WFS }, schema] = await Promise.all([
    import('ol/format/WFS.js'),
    readXml(urlWithParams(WFS_URL, { service: 'WFS', version: '2.0.0', request: 'DescribeFeatureType', typeNames: OBSERVATIONS })),
  ])
  const namespace = schema.documentElement.getAttribute('targetNamespace')
  if (!namespace) throw new Error('GeoServer no informó el espacio de nombres de Observaciones.')

  const feature = new Feature()
  feature.setGeometryName('geom')
  feature.setProperties({ nombre: name, descripcion: description, categoria: category, fecha: new Date().toISOString() })
  feature.setGeometry(new Point(toLonLat(coordinate)))

  const transaction = new WFS().writeTransaction([feature], [], [], {
    featureNS: namespace, featurePrefix: 'sig', featureType: 'observaciones',
    srsName: 'urn:ogc:def:crs:EPSG::4326', version: '1.1.0',
  })
  const result = await readXml(WFS_URL, {
    method: 'POST', headers: { 'Content-Type': 'text/xml' }, body: new XMLSerializer().serializeToString(transaction),
  })
  if (nodes(result, 'totalInserted')[0]?.textContent.trim() !== '1') {
    throw new Error('GeoServer no confirmó el alta de la observación.')
  }
}
