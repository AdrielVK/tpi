import { memo, useState } from 'react';
import { ChevronDown, Info, Layers3 } from 'lucide-react';
import { NOMINAL_SCALE, legendUrl } from '../config.js';

/** Leyenda de las capas activas (GetLegendGraphic) con su escala nominal. */
function LegendPanel({ layers, visible }) {
  const [open, setOpen] = useState(true);
  const shown = layers.filter((layer) => visible[layer.id]);

  return (
    <section className="legend">
      <button
        type="button"
        className="legend-head"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="panel-title">
          <Info size={14} aria-hidden="true" />
          Leyenda y escala
        </span>
        <ChevronDown size={15} className="chev" aria-hidden="true" />
      </button>

      {open && (
        <div className="legend-list">
          {shown.length === 0 && (
            <div className="empty-state">
              <Layers3 size={24} aria-hidden="true" />
              <p>Activá una capa para ver su leyenda y su escala.</p>
            </div>
          )}

          {shown.map((layer) => (
            <div key={layer.id} className="legend-item">
              <div className="legend-item-head">
                <span>{layer.label}</span>
                <span className="mono">{NOMINAL_SCALE}</span>
              </div>
              <img
                className="legend-img"
                src={legendUrl(layer.id)}
                alt={`Leyenda de ${layer.label}`}
                loading="lazy"
              />
            </div>
          ))}

          <p className="legend-note">
            La leyenda se genera con GetLegendGraphic de GeoServer y refleja las clases del estilo
            SLD cargado en cada capa.
          </p>
        </div>
      )}
    </section>
  );
}

export default memo(LegendPanel);
