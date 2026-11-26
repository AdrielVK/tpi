import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Compass,
  Crosshair,
  Eraser,
  Layers,
  LocateFixed,
  MapPin,
  Moon,
  PanelRightClose,
  Plus,
  Ruler,
  ScanSearch,
  SlidersHorizontal,
  SquareDashed,
  Sun,
} from 'lucide-react';
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
import { buildGetFeatureUrl, buildInsertXml, parseTransactionSummary } from './lib/wfs.js';
import { formatDistance, formatScale } from './lib/geo.js';

const TOOLS = [
  {
    id: 'query-point',
    label: 'Consultar punto',
    hint: 'Hacé clic en el mapa para consultar la capa elegida en ese punto.',
    icon: MapPin,
  },
  {
    id: 'query-rect',
    label: 'Consultar área',
    hint: 'Arrastrá sobre el mapa para dibujar el rectángulo de consulta.',
    icon: SquareDashed,
  },
  {
    id: 'measure',
    label: 'Medir distancia',
    hint: 'Dibujá una línea; cada trazo se suma a la lista de mediciones.',
    icon: Ruler,
  },
  {
    id: 'insert-point',
    label: 'Agregar observación',
    hint: 'Hacé clic en el mapa para ubicar la nueva observación.',
    icon: Plus,
  },
];

const getInitialTheme = () => {
  try {
    const forced = new URLSearchParams(window.location.search).get('theme');
    if (forced === 'light' || forced === 'dark') return forced;
    const stored = localStorage.getItem('meridiano-theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* almacenamiento no disponible */
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

const INITIAL_OPACITY = Object.fromEntries(LAYERS.map((layer) => [layer.id, 1]));

export default function App() {
  const [visible, setVisible] = useState(INITIAL_VISIBILITY);
  const [opacity, setOpacity] = useState(INITIAL_OPACITY);
  const [tool, setTool] = useState(null);
  const [queryLayer, setQueryLayer] = useState('red_vial');
  const [results, setResults] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [scale, setScale] = useState(null);
  const [pointer, setPointer] = useState(null);
  const [mapApi, setMapApi] = useState(null);
  const [overlayClearKey, setOverlayClearKey] = useState(0);
  const [insertDraft, setInsertDraft] = useState(null);
  const [inserting, setInserting] = useState(false);
  const [insertError, setInsertError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [roadActive, setRoadActive] = useState(DEFAULT_ROAD_ACTIVE);
  const [secondaryActive, setSecondaryActive] = useState(DEFAULT_SECONDARY_ACTIVE);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('meridiano-theme', theme);
    } catch {
      /* almacenamiento no disponible */
    }
  }, [theme]);

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
    setSecondaryActive((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
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

  const setLayerOpacity = useCallback((id, value) => {
    setOpacity((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handlePointerMove = useCallback(({ lon, lat }) => {
    setPointer((prev) => {
      if (prev && Math.abs(prev.lon - lon) < 0.00001 && Math.abs(prev.lat - lat) < 0.00001) {
        return prev;
      }
      return { lon, lat };
    });
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
        setNotice(`Observación guardada en ign250.${INSERT_LAYER}.`);
      } catch (error) {
        setInsertError(String(error?.message ?? error));
      } finally {
        setInserting(false);
      }
    },
    [insertDraft, mapApi],
  );

  const clearMeasurements = useCallback(() => {
    setMeasurements([]);
    setOverlayClearKey((key) => key + 1);
  }, []);

  const zoomToResults = useCallback(() => {
    mapApi?.zoomToResults?.();
  }, [mapApi]);

  const collapseLeft = useCallback(() => setLeftOpen(false), []);
  const collapseRight = useCallback(() => setRightOpen(false), []);
  const toggleTheme = useCallback(() => setTheme((value) => (value === 'dark' ? 'light' : 'dark')), []);

  const activeCount = LAYERS.filter((layer) => visible[layer.id]).length;
  const activeTool = TOOLS.find((entry) => entry.id === tool);
  const ActiveIcon = activeTool?.icon;

  return (
    <div className="app">
      <main className="map-wrap">
        <MapView
          visible={visible}
          tool={tool}
          results={results}
          overlayClearKey={overlayClearKey}
          wmsFilters={wmsFilters}
          layerOpacity={opacity}
          onMeasure={handleMeasure}
          onQuery={handleQuery}
          onInsertPoint={handleInsertPoint}
          onScaleChange={setScale}
          onMapReady={setMapApi}
          onPointerMove={handlePointerMove}
        />
      </main>

      <header className="header-pill glass">
        <div className="brand">
          <span className="brand-mark">
            <Compass size={19} aria-hidden="true" />
          </span>
          <div className="brand-text">
            <span className="brand-name">Meridiano</span>
            <span className="brand-sub">SIG IGN 250 · WMS / WFS</span>
          </div>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn btn--sm"
            onClick={() => mapApi?.fitChaco?.()}
            title="Centrar en la Provincia del Chaco"
          >
            <LocateFixed size={15} aria-hidden="true" />
            <span>Chaco</span>
          </button>
          <button
            type="button"
            className="btn btn--icon btn--ghost"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            title="Cambiar tema"
          >
            {theme === 'dark' ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
          </button>
        </div>
      </header>

      {activeTool && ActiveIcon && (
        <div className="map-hint glass glass--opaque" role="status">
          <ActiveIcon size={16} className="hint-icon" aria-hidden="true" />
          <span className="hint-text">{activeTool.hint}</span>
          <button type="button" className="btn btn--sm" onClick={() => setTool(null)}>
            Cancelar
          </button>
        </div>
      )}

      {leftOpen ? (
        <aside className="panel panel-left glass glass--opaque" aria-label="Panel de capas">
          <LayerPanel
            layers={LAYERS}
            visible={visible}
            onToggle={toggleLayer}
            onAll={setAllLayers}
            opacity={opacity}
            onOpacityChange={setLayerOpacity}
            onCollapse={collapseLeft}
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
      ) : (
        <button
          type="button"
          className="panel-toggle panel-toggle--left glass glass--opaque"
          onClick={() => setLeftOpen(true)}
          aria-label="Mostrar panel de capas"
        >
          <Layers size={16} aria-hidden="true" />
          Capas
          <span className="panel-count">
            {activeCount}/{LAYERS.length}
          </span>
        </button>
      )}

      {rightOpen ? (
        <aside className="panel panel-right glass glass--opaque" aria-label="Panel de consultas">
          <div className="panel-head">
            <h2 className="panel-title">
              <SlidersHorizontal size={15} aria-hidden="true" />
              Consultas y edición
            </h2>
            <button
              type="button"
              className="icon-btn"
              onClick={collapseRight}
              aria-label="Ocultar panel de consultas"
              title="Ocultar panel"
            >
              <PanelRightClose size={17} aria-hidden="true" />
            </button>
          </div>

          <section className="section">
            <label className="field">
              Capa de consulta
              <select value={queryLayer} onChange={(event) => setQueryLayer(event.target.value)}>
                {LAYERS.map((layer) => (
                  <option key={layer.id} value={layer.id}>
                    {layer.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="tool-grid">
              {TOOLS.map((entry) => {
                const Icon = entry.icon;
                const active = tool === entry.id;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    className={`tool-btn${active ? ' is-active' : ''}`}
                    aria-pressed={active}
                    onClick={() => {
                      setNotice(null);
                      setTool((current) => (current === entry.id ? null : entry.id));
                    }}
                  >
                    <Icon size={18} aria-hidden="true" />
                    <span>{entry.label}</span>
                  </button>
                );
              })}
            </div>

            <p className="hint">
              La consulta aplica a la capa elegida. El alta escribe en <code>{INSERT_LAYER}</code>.
            </p>
          </section>

          <section className="section">
            <div className="section-head">
              <h3 className="section-title">
                <ScanSearch size={14} aria-hidden="true" />
                Resultados
              </h3>
              {results && (
                <button type="button" className="btn btn--sm btn--ghost" onClick={() => setResults(null)}>
                  <Eraser size={13} aria-hidden="true" />
                  Limpiar
                </button>
              )}
            </div>
            <ResultsPanel results={results} onZoom={zoomToResults} />
          </section>

          <section className="section">
            <div className="section-head">
              <h3 className="section-title">
                <Ruler size={14} aria-hidden="true" />
                Mediciones
              </h3>
              {measurements.length > 0 && (
                <button type="button" className="btn btn--sm btn--ghost" onClick={clearMeasurements}>
                  <Eraser size={13} aria-hidden="true" />
                  Limpiar
                </button>
              )}
            </div>
            {measurements.length === 0 ? (
              <div className="empty-state">
                <Ruler size={24} aria-hidden="true" />
                <p>Sin mediciones. Usá “Medir distancia”.</p>
              </div>
            ) : (
              <ol className="measure-list">
                {measurements.map((meters, index) => (
                  <li key={index} className="measure-item">
                    <span>Medición {index + 1}</span>
                    <strong>{formatDistance(meters)}</strong>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {notice && (
            <div className="section">
              <p className="notice">{notice}</p>
            </div>
          )}
        </aside>
      ) : (
        <button
          type="button"
          className="panel-toggle panel-toggle--right glass glass--opaque"
          onClick={() => setRightOpen(true)}
          aria-label="Mostrar panel de consultas"
        >
          <SlidersHorizontal size={16} aria-hidden="true" />
          Herramientas
        </button>
      )}

      <footer className="status-pill glass glass--opaque" aria-label="Estado del mapa">
        <span className="status-dot" aria-hidden="true" />
        <span className="status-item">
          <Crosshair size={14} aria-hidden="true" />
          <span className="status-label">Lat, Lon</span>
          <span className="mono">
            {pointer ? `${pointer.lat.toFixed(5)}, ${pointer.lon.toFixed(5)}` : '—'}
          </span>
        </span>
        <span className="status-divider" aria-hidden="true" />
        <span className="status-item">
          <Ruler size={14} aria-hidden="true" />
          <span className="status-label">Escala</span>
          <span className="mono">{scale ? formatScale(scale.denominator) : '—'}</span>
        </span>
      </footer>

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
