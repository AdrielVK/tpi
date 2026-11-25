import { NOMINAL_SCALE, legendUrl } from '../config.js';

/** Leyenda de las capas activas (GetLegendGraphic) con su escala nominal. */
export default function LegendPanel({ layers, visible }) {
  const shown = layers.filter((layer) => visible[layer.id]);

  return (
    <section className="legend">
      <h2>Leyenda y escala</h2>
      {shown.length === 0 && <p className="muted">Active alguna capa para ver su leyenda.</p>}
      {shown.map((layer) => (
        <div key={layer.id} className="legend-item">
          <div className="legend-head">
            <span>{layer.label}</span>
            <span className="muted small">{NOMINAL_SCALE}</span>
          </div>
          <img
            className="legend-img"
            src={legendUrl(layer.id)}
            alt={`Leyenda de ${layer.label}`}
            loading="lazy"
          />
        </div>
      ))}
      <p className="muted small">
        La leyenda se genera con GetLegendGraphic de GeoServer y refleja las clases del estilo SLD
        cargado en cada capa.
      </p>
    </section>
  );
}
