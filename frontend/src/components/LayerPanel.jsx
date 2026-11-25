import { useMemo, useState } from 'react';

/** Catalogo de capas agrupado por tema, con buscador y activacion por capa. */
export default function LayerPanel({ layers, visible, onToggle, onAll }) {
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
            <label key={layer.id} className={`layer-item${visible[layer.id] ? ' on' : ''}`}>
              <input type="checkbox" checked={Boolean(visible[layer.id])} onChange={() => onToggle(layer.id)} />
              <span>{layer.label}</span>
            </label>
          ))}
        </section>
      ))}
    </div>
  );
}
