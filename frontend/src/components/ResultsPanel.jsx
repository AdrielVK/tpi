import { LAYERS } from '../config.js';
import { summarizeProperties } from '../lib/geo.js';

const MAX_ROWS = 60;

const labelFor = (id) => LAYERS.find((layer) => layer.id === id)?.label ?? id;

/** Tabla de atributos de la consulta grafica actual. */
export default function ResultsPanel({ results, onZoom }) {
  if (!results) {
    return <p className="muted">Elija una capa y consulte por punto o por rectangulo.</p>;
  }
  if (results.loading) {
    return <p className="muted">Consultando…</p>;
  }
  if (results.error) {
    return <p className="error">Error al consultar: {results.error}</p>;
  }

  const features = results.geojson?.features ?? [];
  if (features.length === 0) {
    return <p className="muted">Sin resultados en {labelFor(results.layer)} para el area consultada.</p>;
  }

  return (
    <div>
      <div className="row-actions results-head">
        <span><strong>{features.length}</strong> resultado(s) en {labelFor(results.layer)}</span>
        <button type="button" onClick={onZoom}>Zoom a resultados</button>
      </div>
      <ol className="results">
        {features.slice(0, MAX_ROWS).map((feature, index) => (
          <li key={feature.id ?? index}>
            <div className="result-title">{feature.id ?? `feature ${index + 1}`}</div>
            <table>
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
        <p className="muted small">Mostrando {MAX_ROWS} de {features.length} resultados.</p>
      )}
    </div>
  );
}
