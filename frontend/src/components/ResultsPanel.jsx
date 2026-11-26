import { memo } from 'react';
import { Loader2, SearchX } from 'lucide-react';
import { LAYERS } from '../config.js';
import { summarizeProperties } from '../lib/geo.js';

const MAX_ROWS = 60;

const labelFor = (id) => LAYERS.find((layer) => layer.id === id)?.label ?? id;

/** Tabla de atributos de la consulta gráfica actual. */
function ResultsPanel({ results, onZoom }) {
  if (!results) {
    return (
      <div className="empty-state">
        <SearchX size={26} aria-hidden="true" />
        <p>Elegí una capa y consultá por punto o por área para ver sus atributos.</p>
      </div>
    );
  }

  if (results.loading) {
    return (
      <div className="spinner">
        <Loader2 size={16} aria-hidden="true" />
        Consultando…
      </div>
    );
  }

  if (results.error) {
    return <p className="error">Error al consultar: {results.error}</p>;
  }

  const features = results.geojson?.features ?? [];
  if (features.length === 0) {
    return (
      <div className="empty-state">
        <SearchX size={26} aria-hidden="true" />
        <p>Sin resultados en {labelFor(results.layer)} para el área consultada.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="result-head">
        <span>
          <strong className="mono">{features.length}</strong> resultado(s) en {labelFor(results.layer)}
        </span>
        <button type="button" className="btn btn--sm" onClick={onZoom}>
          Zoom
        </button>
      </div>
      <ol className="result-list">
        {features.slice(0, MAX_ROWS).map((feature, index) => (
          <li key={feature.id ?? index} className="result-card">
            <div className="result-title">{feature.id ?? `feature ${index + 1}`}</div>
            <table className="result-table">
              <tbody>
                {summarizeProperties(feature.properties).map((prop) => (
                  <tr key={prop.key}>
                    <th scope="row">{prop.key}</th>
                    <td>{prop.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </li>
        ))}
      </ol>
      {features.length > MAX_ROWS && (
        <p className="legend-note">
          Mostrando {MAX_ROWS} de {features.length} resultados.
        </p>
      )}
    </div>
  );
}

export default memo(ResultsPanel);
