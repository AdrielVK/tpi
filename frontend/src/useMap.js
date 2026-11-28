import { useEffect, useRef } from 'react'
import Feature from 'ol/Feature.js'
import OlMap from 'ol/Map.js'
import View from 'ol/View.js'
import { defaults as defaultControls } from 'ol/control/defaults.js'
import GeoJSON from 'ol/format/GeoJSON.js'
import Point from 'ol/geom/Point.js'
import Draw, { createBox } from 'ol/interaction/Draw.js'
import ImageLayer from 'ol/layer/Image.js'
import TileLayer from 'ol/layer/Tile.js'
import VectorLayer from 'ol/layer/Vector.js'
import { unByKey } from 'ol/Observable.js'
import { fromLonLat, getPointResolution, toLonLat, transformExtent } from 'ol/proj.js'
import ImageWMS from 'ol/source/ImageWMS.js'
import OSM from 'ol/source/OSM.js'
import VectorSource from 'ol/source/Vector.js'
import { getLength } from 'ol/sphere.js'
import { Circle, Fill, Stroke, Style } from 'ol/style.js'
import { MAP_PROJECTION, WMS_URL } from './geoserver.js'

const homeCenter = fromLonLat([-60.55, -26.35])
const homeZoom = 7.3
const provinceExtent = transformExtent([-63.43, -28.0, -58.36, -24.09], 'EPSG:4326', MAP_PROJECTION)
const homePadding = [54, 26, 28, 26]
const overlayStyle = new Style({
  stroke: new Stroke({ color: '#08765c', width: 3, lineDash: [8, 5] }),
  fill: new Fill({ color: '#0b876226' }),
  image: new Circle({ radius: 7, fill: new Fill({ color: '#e38b47' }), stroke: new Stroke({ color: '#fff', width: 2 }) }),
})
const highlightStyle = new Style({
  stroke: new Stroke({ color: '#d35427', width: 4 }),
  fill: new Fill({ color: '#ec71303d' }),
  image: new Circle({ radius: 7, fill: new Fill({ color: '#d35427' }), stroke: new Stroke({ color: '#fff', width: 2 }) }),
})

function createWmsLayer(layerId) {
  const options = {
    'sig:provincias': { opacity: 0.3, zIndex: 1 },
    'sig:curso_de_agua_hid': { opacity: 0.7, zIndex: 2 },
    'sig:red_vial': { opacity: 0.57, zIndex: 4 },
  }
  return new ImageLayer({
    zIndex: 5,
    ...options[layerId],
    source: new ImageWMS({
      url: WMS_URL, params: { LAYERS: layerId, TILED: false, FORMAT: 'image/png' },
      serverType: 'geoserver', ratio: 1,
    }),
  })
}

export function useMap(target, visibleLayers, mode, handlers) {
  const engine = useRef(null)
  const callbacks = useRef(handlers)

  useEffect(() => {
    callbacks.current = handlers
  }, [handlers])

  useEffect(() => {
    const graphics = new VectorSource()
    const highlights = new VectorSource()
    const view = new View({ projection: MAP_PROJECTION, center: homeCenter, zoom: homeZoom, minZoom: 3, maxZoom: 19 })
    const map = new OlMap({
      target: target.current,
      view,
      controls: defaultControls({ zoom: false, rotate: false, attributionOptions: { collapsible: false } }),
      layers: [
        new TileLayer({ className: 'base-map', source: new OSM(), zIndex: 0 }),
        new VectorLayer({ source: highlights, style: highlightStyle, zIndex: 30 }),
        new VectorLayer({ source: graphics, style: overlayStyle, zIndex: 35 }),
      ],
    })
    engine.current = { map, graphics, highlights, wmsLayers: new Map() }
    if (map.getSize()) view.fit(provinceExtent, { padding: homePadding })

    function updateScale() {
      const groundResolution = getPointResolution(MAP_PROJECTION, view.getResolution(), view.getCenter(), 'm')
      callbacks.current.onScale(groundResolution)
    }
    const events = [view.on('change:resolution', updateScale), map.on('moveend', updateScale), map.on('pointermove', (event) => {
      if (!event.dragging) callbacks.current.onCoordinate(toLonLat(event.coordinate))
    })]
    updateScale()
    return () => {
      unByKey(events)
      map.dispose()
      engine.current = null
    }
  }, [target])

  useEffect(() => {
    const { map, wmsLayers } = engine.current
    for (const [id, layer] of wmsLayers) layer.setVisible(visibleLayers.includes(id))
    for (const id of visibleLayers) {
      if (wmsLayers.has(id)) continue
      const layer = createWmsLayer(id)
      wmsLayers.set(id, layer)
      map.addLayer(layer)
    }
  }, [visibleLayers])

  useEffect(() => {
    if (!mode) return
    const { map, graphics } = engine.current

    if (mode === 'point' || mode === 'observation') {
      const click = map.on('singleclick', ({ coordinate }) => {
        if (mode === 'point') {
          callbacks.current.onPoint(coordinate)
        } else {
          graphics.clear()
          graphics.addFeature(new Feature(new Point(coordinate)))
          callbacks.current.onObservation(coordinate)
        }
      })
      return () => unByKey(click)
    }

    const measuring = mode === 'measure'
    const draw = new Draw({
      source: graphics,
      type: measuring ? 'LineString' : 'Circle',
      geometryFunction: measuring ? undefined : createBox(),
      style: overlayStyle,
      stopClick: true,
    })
    let geometryListener
    draw.on('drawstart', ({ feature }) => {
      graphics.clear()
      if (measuring) {
        const geometry = feature.getGeometry()
        geometryListener = geometry.on('change', () => callbacks.current.onMeasure(getLength(geometry, { projection: MAP_PROJECTION })))
      } else {
        callbacks.current.onRectangleStart()
      }
    })
    draw.on('drawend', ({ feature }) => {
      if (geometryListener) unByKey(geometryListener)
      const geometry = feature.getGeometry()
      if (measuring) callbacks.current.onMeasure(getLength(geometry, { projection: MAP_PROJECTION }))
      else callbacks.current.onExtent(geometry.getExtent())
    })
    map.addInteraction(draw)
    return () => {
      if (geometryListener) unByKey(geometryListener)
      draw.abortDrawing()
      map.removeInteraction(draw)
    }
  }, [mode])

  return {
    pointContext(layerId) {
      const { wmsLayers, map } = engine.current
      const view = map.getView()
      return { source: wmsLayers.get(layerId)?.getSource(), resolution: view.getResolution(), projection: view.getProjection() }
    },
    highlight(collection, dataProjection) {
      const { highlights } = engine.current
      highlights.clear()
      const features = new GeoJSON().readFeatures(collection, { dataProjection, featureProjection: MAP_PROJECTION })
      highlights.addFeatures(features.filter((feature) => feature.getGeometry()))
    },
    clearHighlights() { engine.current?.highlights.clear() },
    clearGraphics() { engine.current?.graphics.clear() },
    refreshLayer(layerId) { engine.current?.wmsLayers.get(layerId)?.getSource().refresh() },
    zoomBy(delta) {
      const view = engine.current.map.getView()
      view.animate({ zoom: view.getZoom() + delta, duration: 220 })
    },
    goHome() { engine.current.map.getView().fit(provinceExtent, { padding: homePadding, duration: 400 }) },
  }
}
