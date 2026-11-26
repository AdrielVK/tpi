import { useCallback, useMemo, useState } from 'react';
import MapView from './components/MapView.jsx';
import LayerPanel from './components/LayerPanel.jsx';
import LegendPanel from './components/LegendPanel.jsx';
import ResultsPanel from './components/ResultsPanel.jsx';
import InsertDialog from './components/InsertDialog.jsx';
import {
  DEFAULT_ROAD_ACTIVE,
  DEFAULT_SECONDARY_ACTIVE,
  FEATURE_NS,
  GEOSERVER_URL,
  INITIAL_VISIBILITY,
  INSERT_LAYER,
  LAYERS,
  ROAD_CLASSES,
  ROAD_PRESETS,
  SECONDARY_CLASSES,
  SECONDARY_PRESETS,
  WFS_URL,
  WORKSPACE,
  geoserverAuthHeader,
} from './config.js';
import { combineCql } from './lib/filters.js';
import { formatDistance, formatScale } from './lib/geo.js';
import { buildGetFeatureUrl, buildInsertXml, parseTransactionSummary } from './lib/wfs.js';

const TOOLS = [
  {
    id: 'query-point',
    label: 'Consultar por punto',
    hint: 'Haga clic en el mapa para consultar la capa elegida en ese punto.',
  },
  {
    id: 'query-rect',
    label: 'Consultar por rectangulo',
    hint: 'Arrastre sobre el mapa para dibujar el rectangulo de consulta.',
  },
  {
    id: 'measure',
    label: 'Medir distancia',
    hint: 'Dibuje una linea; cada trazo se agrega a la lista de mediciones.',
  },
  {
    id: 'insert-point',
    label: 'Agregar observacion',
    hint: 'Haga clic en el mapa para ubicar la nueva observacion.',
  },
];

export default function App() {
  const [visible, setVisible] = useState(INITIAL_VISIBILITY);
  const [tool, setTool] = useState(null);
  const [queryLayer, setQueryLayer] = useState('red_vial');
  const [results, setResults] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [scale, setScale] = useState(null);
  const [mapApi, setMapApi] = useState(null);
  const [overlayClearKey, setOverlayClearKey] = useState(0);
  const [insertDraft, setInsertDraft] = useState(null);
  const [inserting, setInserting] = useState(false);
  const [insertError, setInsertError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [roadActive, setRoadActive] = useState(DEFAULT_ROAD_ACTIVE);
  const [secondaryActive, setSecondaryActive] = useState(DEFAULT_SECONDARY_ACTIVE);

  const roadCql = useMemo(() => combineCql(ROAD_CLASSES, roadActive), [roadActive]);
  const secondaryCql = useMemo(() => combineCql(SECONDARY_CLASSES, secondaryActive), [secondaryActive]);
  const wmsFilters = useMemo(
    () => ({ red_vial: roadCql, vias_secundarias: secondaryCql }),
    [roadCql, secondaryCql],
  );

  const toggleRoadClass = useCallback((id) => {
    setRoadActive((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }, []);

  const applyRoadPreset = useCallback((preset) => {
    setRoadActive(preset.classes ?? ROAD_CLASSES.map((entry) => entry.id));
  }, []);

  const toggleSecondaryClass = useCallback((id) => {
    setSecondaryActive((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }, []);

  const applySecondaryPreset = useCallback((preset) => {
    setSecondaryActive(preset.classes ?? SECONDARY_CLASSES.map((entry) => entry.id));
  }, []);

  const toggleLayer = useCallback((id) => {
    setVisible((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const setAllLayers = useCallback((value) => {
    setVisible(Object.fromEntries(LAYERS.map((layer) => [layer.id, value])));
  }, []);

  const handleQuery = useCallback(
    async ({ mode, point4326, extent4326, toleranceDegrees }) => {
      setTool(null);
      setNotice(null);
      setResults({ layer: queryLayer, loading: true, geojson: null });
      try {
        const cqlFilter =
          queryLayer === 'red_vial'
            ? roadCql
            : queryLayer === 'vias_secundarias'
              ? secondaryCql
              : '';
        const url = buildGetFeatureUrl({
          baseUrl: GEOSERVER_URL,
          workspace: WORKSPACE,
          layer: queryLayer,
          mode,
          point4326,
          extent4326,
          toleranceDegrees,
          cqlFilter,
          maxFeatures: 200,
        });
        const response = await fetch(url);
        if (!response.ok) throw new Error(`WFS respondio HTTP ${response.status}`);
        const geojson = await response.json();
        setResults({ layer: queryLayer, geojson, loading: false });
      } catch (error) {
        setResults({
          layer: queryLayer,
          error: String(error?.message ?? error),
          geojson: null,
          loading: false,
        });
      }
    },
    [queryLayer, roadCql, secondaryCql],
  );

  const handleMeasure = useCallback((meters) => {
    setMeasurements((list) => [...list, meters]);
  }, []);

  const handleInsertPoint = useCallback(({ lon, lat }) => {
    setTool(null);
    setNotice(null);
    setInsertError(null);
    setInsertDraft({ lon, lat });
  }, []);

  const submitInsert = useCallback(
    async ({ nombre, categoria, descripcion }) => {
      if (!insertDraft) return;
      setInserting(true);
      setInsertError(null);
      try {
        const xml = buildInsertXml({
          workspace: WORKSPACE,
          namespace: FEATURE_NS,
          layer: INSERT_LAYER,
          properties: { nombre, categoria, descripcion },
          lon: insertDraft.lon,
          lat: insertDraft.lat,
        });
        const response = await fetch(WFS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/xml;charset=UTF-8',
            Authorization: geoserverAuthHeader(),
          },
          body: xml,
        });
        const text = await response.text();
        const summary = parseTransactionSummary(text);
        if (!response.ok || !summary || summary.inserted < 1) {
          throw new Error(
            'GeoServer rechazo el alta. Verifique que WFS-T este habilitado y que exista ign250.observaciones.',
          );
        }
        setInsertDraft(null);
        setVisible((prev) => ({ ...prev, [INSERT_LAYER]: true }));
        mapApi?.refreshLayer?.(INSERT_LAYER);
        mapApi?.clearOverlay?.();
        setNotice(`Observacion guardada en ign250.${INSERT_LAYER}.`);
      } catch (error) {
        setInsertError(String(error?.message ?? error));
      } finally {
        setInserting(false);
      }
    },
    [insertDraft, mapApi],
  );

  const clearMeasurements = () => {
    setMeasurements([]);
    setOverlayClearKey((key) => key + 1);
  };

  const activeTool = TOOLS.find((entry) => entry.id === tool);

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>SIG IGN 250 — Trabajo Practico Integrador</h1>
          <p className="subtitle">Visualizacion de capas servidas por GeoServer (WMS / WFS) · {GEOSERVER_URL}</p>
        </div>
        <div className="header-status">
          {scale && <span className="scale-badge">Escala {formatScale(scale.denominator)}</span>}
          <button type="button" onClick={() => mapApi?.fitChaco?.()}>Ir al Chaco</button>
        </div>
      </header>

      <div className="body">
        <aside className="panel left">
          <LayerPanel
            layers={LAYERS}
            visible={visible}
            onToggle={toggleLayer}
            onAll={setAllLayers}
            roadClasses={ROAD_CLASSES}
            roadActive={roadActive}
            onRoadToggle={toggleRoadClass}
            onRoadPreset={applyRoadPreset}
            secondaryClasses={SECONDARY_CLASSES}
            secondaryActive={secondaryActive}
            onSecondaryToggle={toggleSecondaryClass}
            onSecondaryPreset={applySecondaryPreset}
            roadPresets={ROAD_PRESETS}
            secondaryPresets={SECONDARY_PRESETS}
          />
          <LegendPanel layers={LAYERS} visible={visible} />
        </aside>

        <main className="map-wrap">
          <MapView
            visible={visible}
            tool={tool}
            results={results}
            overlayClearKey={overlayClearKey}
            wmsFilters={wmsFilters}
            onMeasure={handleMeasure}
            onQuery={handleQuery}
            onInsertPoint={handleInsertPoint}
            onScaleChange={setScale}
            onMapReady={setMapApi}
          />
          {activeTool && (
            <div className="map-hint">
              <strong>{activeTool.label}</strong>
              <span>{activeTool.hint}</span>
              <button type="button" onClick={() => setTool(null)}>Cancelar</button>
            </div>
          )}
          <div className="map-footer muted small">
            Base: OpenStreetMap · Datos: IGN 250 · Escala nominal de las capas: 1:250.000
          </div>
        </main>

        <aside className="panel right">
          <section>
            <h2>Consultas y edicion</h2>
            <label className="field">
              Capa de consulta
              <select value={queryLayer} onChange={(event) => setQueryLayer(event.target.value)}>
                {LAYERS.map((layer) => (
                  <option key={layer.id} value={layer.id}>{layer.label}</option>
                ))}
              </select>
            </label>
            <div className="tool-grid">
              {TOOLS.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className={tool === entry.id ? 'active' : ''}
                  onClick={() => {
                    setNotice(null);
                    setTool((current) => (current === entry.id ? null : entry.id));
                  }}
                >
                  {entry.label}
                </button>
              ))}
            </div>
            <p className="muted small">
              La consulta aplica a la capa elegida arriba. El alta siempre escribe en la capa
              editable <code>{INSERT_LAYER}</code>.
            </p>
          </section>

          <section>
            <div className="section-head">
              <h2>Resultados de consulta</h2>
              {results && <button type="button" onClick={() => setResults(null)}>Limpiar</button>}
            </div>
            <ResultsPanel results={results} onZoom={() => mapApi?.zoomToResults?.()} />
          </section>

          <section>
            <div className="section-head">
              <h2>Mediciones</h2>
              {measurements.length > 0 && (
                <button type="button" onClick={clearMeasurements}>Limpiar</button>
              )}
            </div>
            {measurements.length === 0 ? (
              <p className="muted">Sin mediciones. Use “Medir distancia”.</p>
            ) : (
              <ol className="measurements">
                {measurements.map((meters, index) => (
                  <li key={index}>
                    <span>Medicion {index + 1}</span>
                    <strong>{formatDistance(meters)}</strong>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {notice && <p className="notice">{notice}</p>}
        </aside>
      </div>

      {insertDraft && (
        <InsertDialog
          draft={insertDraft}
          submitting={inserting}
          error={insertError}
          onCancel={() => {
            setInsertDraft(null);
            setInsertError(null);
          }}
          onSubmit={submitInsert}
        />
      )}
    </div>
  );
}
