import { useMemo, useState } from 'react';

/** Subfiltro de componentes de una red (checkboxes + presets). */
function SubFilter({ classes, active, presets, onToggle, onPreset }) {
  const allIds = classes.map((entry) => entry.id);

  return (
    <div className="sublayer">
      <div className="row-actions sublayer-presets">
        {presets.map((preset) => {
          const ids = preset.classes ?? allIds;
          const isActive = ids.length === active.length && ids.every((id) => active.includes(id));
          return (
            <button
              key={preset.id}
              type="button"
              className={isActive ? 'active' : ''}
              onClick={() => onPreset(preset)}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
      {classes.map((entry) => (
        <label key={entry.id} className="layer-item sub">
          <input
            type="checkbox"
            checked={active.includes(entry.id)}
            onChange={() => onToggle(entry.id)}
          />
          <span>{entry.label}</span>
        </label>
      ))}
      <p className="muted small">Aplica al mapa y a las consultas.</p>
    </div>
  );
}

/** Catalogo de capas agrupado por tema, con buscador y activacion por capa. */
export default function LayerPanel({
  layers,
  visible,
  onToggle,
  onAll,
  roadClasses,
  roadActive,
  onRoadToggle,
  onRoadPreset,
  secondaryClasses,
  secondaryActive,
  onSecondaryToggle,
  onSecondaryPreset,
  roadPresets,
  secondaryPresets,
}) {
  const [search, setSearch] = useState('');

  const groups = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = layers.filter(
      (layer) => !term || layer.label.toLowerCase().includes(term) || layer.id.includes(term),
    );
    const byGroup = new Map();
    for (const layer of filtered) {
      if (!byGroup.has(layer.group)) byGroup.set(layer.group, []);
      byGroup.get(layer.group).push(layer);
    }
    return [...byGroup.entries()];
  }, [layers, search]);

  const activeCount = layers.filter((layer) => visible[layer.id]).length;

  return (
    <div className="layers">
      <div className="section-head">
        <h2>Capas</h2>
        <span className="badge">{activeCount}/{layers.length}</span>
      </div>
      <input
        type="search"
        className="search"
        placeholder="Buscar capa..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        aria-label="Buscar capa"
      />
      <div className="row-actions">
        <button type="button" onClick={() => onAll(true)}>Todas</button>
        <button type="button" onClick={() => onAll(false)}>Ninguna</button>
      </div>
      {groups.length === 0 && <p className="muted">Sin capas que coincidan.</p>}
      {groups.map(([group, items]) => (
        <section key={group} className="layer-group">
          <h3>{group}</h3>
          {items.map((layer) => (
            <div key={layer.id}>
              <label className={`layer-item${visible[layer.id] ? ' on' : ''}`}>
                <input type="checkbox" checked={Boolean(visible[layer.id])} onChange={() => onToggle(layer.id)} />
                <span>{layer.label}</span>
              </label>
              {layer.id === 'red_vial' && visible.red_vial && (
                <SubFilter
                  classes={roadClasses}
                  active={roadActive}
                  presets={roadPresets}
                  onToggle={onRoadToggle}
                  onPreset={onRoadPreset}
                />
              )}
              {layer.id === 'vias_secundarias' && visible.vias_secundarias && (
                <SubFilter
                  classes={secondaryClasses}
                  active={secondaryActive}
                  presets={secondaryPresets}
                  onToggle={onSecondaryToggle}
                  onPreset={onSecondaryPreset}
                />
              )}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
