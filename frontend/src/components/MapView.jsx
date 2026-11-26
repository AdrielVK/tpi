import { useEffect, useRef } from 'react';
import OlMap from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import TileWMS from 'ol/source/TileWMS';
import OSM from 'ol/source/OSM';
import Draw, { createBox } from 'ol/interaction/Draw';
import ScaleLine from 'ol/control/ScaleLine';
import { defaults as defaultControls } from 'ol/control';
import GeoJSON from 'ol/format/GeoJSON';
import { fromLonLat } from 'ol/proj';
import { getLength } from 'ol/sphere';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import CircleStyle from 'ol/style/Circle';
import { CHACO_CENTER, CHACO_ZOOM, LAYERS, WMS_URL, WORKSPACE } from '../config.js';
import { scaleDenominator } from '../lib/geo.js';

const overlayStyle = (feature) => {
  const type = feature.getGeometry().getType();
  if (type === 'Point' || type === 'MultiPoint') {
    return new Style({
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({ color: '#2e7d32' }),
        stroke: new Stroke({ color: '#ffffff', width: 2 }),
      }),
    });
  }
  if (type === 'Polygon' || type === 'MultiPolygon') {
    return new Style({
      fill: new Fill({ color: 'rgba(25, 118, 210, 0.12)' }),
      stroke: new Stroke({ color: '#1976d2', width: 2, lineDash: [6, 4] }),
    });
  }
  return new Style({ stroke: new Stroke({ color: '#d32f2f', width: 3 }) });
};

const resultsStyle = new Style({
  fill: new Fill({ color: 'rgba(255, 193, 7, 0.35)' }),
  stroke: new Stroke({ color: '#ff8f00', width: 3 }),
  image: new CircleStyle({
    radius: 6,
    fill: new Fill({ color: '#ff8f00' }),
    stroke: new Stroke({ color: '#ffffff', width: 2 }),
  }),
});

/**
 * Mapa OpenLayers: base OSM, una capa WMS por capa del catalogo, y capas
 * vectoriales para el dibujo del usuario y el resaltado de resultados.
 */
export default function MapView({
  visible,
  tool,
  results,
  overlayClearKey,
  wmsFilters,
  onMeasure,
  onQuery,
  onInsertPoint,
  onScaleChange,
  onMapReady,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const wmsRef = useRef(null);
  const overlayRef = useRef(null);
  const resultsSourceRef = useRef(null);
  const drawRef = useRef(null);
  const callbacksRef = useRef({});

  callbacksRef.current = { onMeasure, onQuery, onInsertPoint, onScaleChange, onMapReady };

  useEffect(() => {
    const overlaySource = new VectorSource();
    const resultsSource = new VectorSource();
    overlayRef.current = overlaySource;
    resultsSourceRef.current = resultsSource;

    const baseLayer = new TileLayer({ source: new OSM() });

    const wmsById = new Map();
    const wmsLayers = LAYERS.map((entry) => {
      const layer = new TileLayer({
        source: new TileWMS({
          url: WMS_URL,
          params: {
            LAYERS: `${WORKSPACE}:${entry.id}`,
            TILED: true,
            FORMAT: 'image/png',
            TRANSPARENT: true,
          },
          serverType: 'geoserver',
          crossOrigin: 'anonymous',
          transition: 0,
        }),
        visible: Boolean(entry.visible),
        properties: { layerId: entry.id },
      });
      wmsById.set(entry.id, layer);
      return layer;
    });
    wmsRef.current = wmsById;

    const map = new OlMap({
      target: containerRef.current,
      layers: [
        baseLayer,
        ...wmsLayers,
        new VectorLayer({ source: resultsSource, zIndex: 80, style: resultsStyle }),
        new VectorLayer({ source: overlaySource, zIndex: 90, style: overlayStyle }),
      ],
      view: new View({ center: fromLonLat(CHACO_CENTER), zoom: CHACO_ZOOM }),
      controls: defaultControls().extend([new ScaleLine({ units: 'metric' })]),
    });
    mapRef.current = map;

    const emitScale = () => {
      const resolution = map.getView().getResolution();
      if (!resolution) return;
      callbacksRef.current.onScaleChange?.({ resolution, denominator: scaleDenominator(resolution) });
    };
    map.on('moveend', emitScale);
    emitScale();

    callbacksRef.current.onMapReady?.({
      map,
      zoomToResults: () => {
        const extent = resultsSource.getExtent();
        if (Number.isFinite(extent[0]) && Number.isFinite(extent[2])) {
          map.getView().fit(extent, { padding: [60, 60, 60, 60], maxZoom: 17, duration: 300 });
        }
      },
      clearOverlay: () => overlaySource.clear(),
      refreshLayer: (id) => wmsById.get(id)?.getSource()?.refresh(),
      fitChaco: () => map.getView().animate({ center: fromLonLat(CHACO_CENTER), zoom: CHACO_ZOOM }),
    });

    return () => {
      map.setTarget(undefined);
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!wmsRef.current) return;
    for (const [id, layer] of wmsRef.current) {
      layer.setVisible(Boolean(visible[id]));
    }
  }, [visible]);

  useEffect(() => {
    if (!wmsRef.current) return;
    for (const [id, expression] of Object.entries(wmsFilters ?? {})) {
      const source = wmsRef.current.get(id)?.getSource();
      if (!source) continue;
      const next = expression || '1=1';
      if (source.getParams().CQL_FILTER === next) continue;
      source.updateParams({ CQL_FILTER: next });
    }
  }, [wmsFilters]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (drawRef.current) {
      map.removeInteraction(drawRef.current);
      drawRef.current = null;
    }
    if (!tool) return;

    let draw;
    if (tool === 'measure') {
      draw = new Draw({ source: overlayRef.current, type: 'LineString' });
    } else if (tool === 'query-rect') {
      draw = new Draw({ source: overlayRef.current, type: 'Circle', geometryFunction: createBox() });
    } else {
      draw = new Draw({ source: overlayRef.current, type: 'Point' });
    }

    draw.on('drawend', (event) => {
      const geometry = event.feature.getGeometry();
      if (tool === 'measure') {
        callbacksRef.current.onMeasure?.(getLength(geometry));
        return;
      }
      const inWgs84 = geometry.clone();
      inWgs84.transform('EPSG:3857', 'EPSG:4326');
      if (tool === 'query-point') {
        const [lon, lat] = inWgs84.getCoordinates();
        // Tolerancia de "identify": ~4 px convertidos a grados segun la resolucion actual.
        const resolution = map.getView().getResolution() ?? 0;
        const groundMeters = resolution * Math.cos((lat * Math.PI) / 180);
        const toleranceMeters = Math.max(groundMeters * 4, 25);
        callbacksRef.current.onQuery?.({
          mode: 'point',
          point4326: [lon, lat],
          toleranceDegrees: toleranceMeters / 111320,
        });
      } else if (tool === 'query-rect') {
        callbacksRef.current.onQuery?.({ mode: 'bbox', extent4326: inWgs84.getExtent() });
      } else if (tool === 'insert-point') {
        const [lon, lat] = inWgs84.getCoordinates();
        callbacksRef.current.onInsertPoint?.({ lon, lat });
      }
    });

    map.addInteraction(draw);
    drawRef.current = draw;

    return () => {
      if (drawRef.current === draw) {
        map.removeInteraction(draw);
        drawRef.current = null;
      }
    };
  }, [tool]);

  useEffect(() => {
    const source = resultsSourceRef.current;
    if (!source) return;
    source.clear();
    const geojson = results?.geojson;
    if (!geojson?.features?.length) return;
    const features = new GeoJSON().readFeatures(geojson, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    });
    source.addFeatures(features);
  }, [results]);

  useEffect(() => {
    if (overlayClearKey > 0) overlayRef.current?.clear();
  }, [overlayClearKey]);

  return <div className="map" ref={containerRef} role="application" aria-label="Mapa de capas SIG" />;
}
