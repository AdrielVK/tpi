import { memo, useMemo, useState } from 'react';
import { ChevronDown, Layers, PanelLeftClose, Search, SearchX } from 'lucide-react';

/** Subfiltro de componentes de una red (chips de preset + checkboxes). */
function SubFilter({ classes, active, presets, onToggle, onPreset }) {
  const allIds = classes.map((entry) => entry.id);

  return (
    <div className="subfilter">
      <div className="subfilter-presets">
        {presets.map((preset) => {
          const ids = preset.classes ?? allIds;
          const isActive = ids.length === active.length && ids.every((id) => active.includes(id));
          return (
            <button
              key={preset.id}
              type="button"
              className={`chip${isActive ? ' is-active' : ''}`}
              onClick={() => onPreset(preset)}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
      {classes.map((entry) => (
        <label key={entry.id} className="subfilter-check">
          <input
            type="checkbox"
            checked={active.includes(entry.id)}
            onChange={() => onToggle(entry.id)}
          />
          <span>{entry.label}</span>
        </label>
      ))}
    </div>
  );
}

const INITIAL_OPEN_GROUPS = {
  'Vias de comunicacion': true,
};

/** Árbol de capas en acordeones, con buscador, contador y opacidad. */
function LayerPanel({
  layers,
  visible,
  onToggle,
  onAll,
  opacity,
  onOpacityChange,
  onCollapse,
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
  const [openGroups, setOpenGroups] = useState(INITIAL_OPEN_GROUPS);

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
  const searching = search.trim().length > 0;

  const toggleGroup = (group) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const opacityPct = (id) => Math.round((opacity?.[id] ?? 1) * 100);

  return (
    <div className="layers">
      <div className="panel-head">
        <h2 className="panel-title">
          <Layers size={15} aria-hidden="true" />
          Capas
        </h2>
        <div className="row-actions">
          <span className="panel-count" aria-label={`${activeCount} de ${layers.length} capas activas`}>
            {activeCount}/{layers.length}
          </span>
          <button
            type="button"
            className="icon-btn"
            onClick={onCollapse}
            aria-label="Ocultar panel de capas"
            title="Ocultar panel"
          >
            <PanelLeftClose size={17} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="search-field">
        <Search size={15} aria-hidden="true" />
        <input
          type="search"
          className="search"
          placeholder="Buscar capa..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Buscar capa"
        />
      </div>

      <div className="layer-actions">
        <button type="button" className="btn btn--sm" onClick={() => onAll(true)}>
          Todas
        </button>
        <button type="button" className="btn btn--sm" onClick={() => onAll(false)}>
          Ninguna
        </button>
      </div>

      <div className="layers-scroll">
        {groups.length === 0 && (
          <div className="empty-state">
            <SearchX size={26} aria-hidden="true" />
            <p>No hay capas que coincidan con “{search.trim()}”.</p>
          </div>
        )}

        {groups.map(([group, items]) => {
          const open = searching ? true : Boolean(openGroups[group]);
          const activeInGroup = items.filter((layer) => visible[layer.id]).length;
          return (
            <section key={group} className="accordion">
              <button
                type="button"
                className="accordion-trigger"
                aria-expanded={open}
                onClick={() => toggleGroup(group)}
              >
                <ChevronDown size={15} className="chev" aria-hidden="true" />
                <span className="accordion-group-name">{group}</span>
                <span className={`group-count${activeInGroup > 0 ? ' has-active' : ''}`}>
                  {activeInGroup}/{items.length}
                </span>
              </button>

              {open && (
                <div className="accordion-body">
                  {items.map((layer) => (
                    <div key={layer.id} className={`layer${visible[layer.id] ? ' is-on' : ''}`}>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={Boolean(visible[layer.id])}
                          onChange={() => onToggle(layer.id)}
                        />
                        <span className="switch-track">
                          <span className="switch-thumb" />
                        </span>
                        <span className="layer-name">{layer.label}</span>
                      </label>

                      {visible[layer.id] && (
                        <div className="opacity">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={opacityPct(layer.id)}
                            aria-label={`Opacidad de ${layer.label}`}
                            onChange={(event) =>
                              onOpacityChange(layer.id, Number(event.target.value) / 100)
                            }
                          />
                          <span className="opacity-value mono">{opacityPct(layer.id)}%</span>
                        </div>
                      )}

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
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default memo(LayerPanel);
