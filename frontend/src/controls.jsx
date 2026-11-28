import { useState } from 'react'
import { FEATURE_LIMIT, legendUrl } from './geoserver.js'

const icons = {
  layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>,
  search: <><circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 4 4"/></>,
  point: <><circle cx="12" cy="12" r="5"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/><circle cx="12" cy="12" r=".8" fill="currentColor" stroke="none"/></>,
  area: <><rect x="4" y="5" width="16" height="14" rx="1.5" strokeDasharray="3 3"/><path d="M9 12h6m-3-3v6"/></>,
  ruler: <><path d="m3 15 12-12 6 6L9 21 3 15Z"/><path d="m8 10 2 2m2-6 2 2m-2 6 2 2"/></>,
  pin: <><path d="M18 10c0 4-6 10-6 10S6 14 6 10a6 6 0 1 1 12 0Z"/><path d="M12 8v4m-2-2h4"/></>,
  plus: <path d="M5 12h14M12 5v14"/>,
  minus: <path d="M5 12h14"/>,
  home: <><path d="m3 11 9-8 9 8M6 10v10h12V10"/><path d="M10 20v-6h4v6"/></>,
  legend: <><path d="M10 6h10M10 12h10M10 18h10"/><rect x="4" y="4.5" width="3" height="3" rx=".5"/><rect x="4" y="10.5" width="3" height="3" rx=".5"/><rect x="4" y="16.5" width="3" height="3" rx=".5"/></>,
  down: <path d="m7 10 5 5 5-5"/>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
  check: <path d="m5 12 4 4L19 6"/>,
  grid: <><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M4 10h16M10 10v10"/></>,
}

export function Icon({ name, size = 20 }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{icons[name]}</svg>
}

function normalize(text) {
  return text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[_\s]+/g, ' ')
}

export function LayerPanel({ layers, visible, active, loading, error, onRetry, onSelect, onToggle }) {
  const [search, setSearch] = useState('')
  const [visibleOnly, setVisibleOnly] = useState(false)
  const searchText = normalize(search.trim())
  const matches = layers.filter((layer) => (!visibleOnly || visible.includes(layer.id)) &&
    normalize(`${layer.title} ${layer.shortName}`).includes(searchText))

  return (
    <aside className="layers-panel" aria-label="Capas del mapa">
      <div className="layers-heading">
        <div className="section-icon"><Icon name="layers" size={19} /></div>
        <div><h2>Capas del mapa</h2><p>{loading ? 'Cargando catálogo…' : `${layers.length} capas disponibles`}</p></div>
      </div>
      <div className="layer-controls">
        <label className="search"><Icon name="search" size={18}/><input type="search" aria-label="Buscar capas" placeholder="Buscar una capa…" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        <div className="tabs" aria-label="Filtrar capas">
          <button aria-pressed={!visibleOnly} onClick={() => setVisibleOnly(false)}>Todas</button>
          <button aria-pressed={visibleOnly} onClick={() => setVisibleOnly(true)}>Visibles <span>{visible.length}</span></button>
        </div>
      </div>
      <div className="layer-list">
        {error && <div className="panel-message" role="alert"><p>{error}</p><button className="text-button" onClick={onRetry}>Volver a conectar</button></div>}
        {!loading && !error && !matches.length && <p className="panel-message">No hay capas para mostrar.</p>}
        {matches.map((layer) => (
          <div className={`layer-row${layer.id === active ? ' is-active' : ''}`} key={layer.id}>
            <button className="layer-name" type="button" title={`Seleccionar ${layer.title}`} aria-pressed={layer.id === active} onClick={() => onSelect(layer.id)}>
              <span className="layer-symbol" style={{ '--layer-color': layer.color }}><Icon name={layer.id === 'sig:observaciones' ? 'pin' : 'layers'} size={17}/></span>
              <span>{layer.title}</span>
            </button>
            <label className="visibility">
              <input type="checkbox" aria-label={`Mostrar ${layer.title}`} checked={visible.includes(layer.id)} onChange={() => onToggle(layer.id)} />
              <span><Icon name="check" size={13}/></span>
            </label>
          </div>
        ))}
      </div>
      <div className="layers-footer"><Icon name="grid" size={16}/> SIG IGN 250</div>
    </aside>
  )
}

const tools = [
  ['point', 'Punto', 'point', 'Consultar por punto'],
  ['rectangle', 'Rectángulo', 'area', 'Consultar por rectángulo'],
  ['measure', 'Medir', 'ruler', 'Medir distancia'],
  ['observation', 'Nueva observación', 'pin', 'Nueva observación'],
]

export function Toolbar({ mode, onTool, active, canInsert, saving }) {
  return (
    <div className="toolbar" role="group" aria-label="Herramientas del mapa">
      {tools.map(([id, label, icon, title]) => {
        const disabled = saving || (id === 'point' && !active?.queryable) || (id === 'rectangle' && !active?.wfs) || (id === 'observation' && !canInsert)
        return <button key={id} type="button" className={id === 'observation' ? 'new-observation' : ''} aria-pressed={mode === id} aria-label={title} title={disabled && id === 'observation' ? 'Se requiere la capa Observaciones y WFS-T' : title} disabled={disabled} onClick={() => onTool(id)}><Icon name={icon} size={18}/><span>{label}</span></button>
      })}
    </div>
  )
}

export function Legend({ layer, visible, expanded, onToggle }) {
  const url = layer && legendUrl(layer.id)
  const [failedUrl, setFailedUrl] = useState(null)
  return (
    <section className="map-card legend" aria-label="Leyenda de la capa activa">
      <button className="card-toggle" aria-expanded={expanded} onClick={onToggle}>
        <span><Icon name="legend" size={18}/> Leyenda</span><span className={expanded ? 'chevron expanded' : 'chevron'}><Icon name="down" size={17}/></span>
      </button>
      {expanded && <div className="legend-content">
        {layer ? <><strong>{layer.title}</strong>{!visible ? <p>Activá la capa para verla en el mapa.</p> : failedUrl === url ? <p>La leyenda no está disponible.</p> : <img key={url} src={url} alt={`Simbología de ${layer.title}`} onError={() => setFailedUrl(url)}/>}</> : <p>Seleccioná una capa para ver su simbología.</p>}
      </div>}
    </section>
  )
}

function labelOf(feature, index) {
  const value = Object.entries(feature.properties ?? {}).find(([name, value]) => /^(nombre|provincia)$/i.test(name) && String(value ?? '').trim())?.[1]
  return value || feature.id || `Entidad ${index + 1}`
}

export function QueryPanel({ query, onClose }) {
  const [selected, setSelected] = useState(0)
  const features = query.collection?.features ?? []
  const properties = Object.entries(features[selected]?.properties ?? {}).filter(([, value]) => value !== null && value !== '')
  const capped = features.length === FEATURE_LIMIT && (query.collection.numberMatched === undefined || query.collection.numberMatched > FEATURE_LIMIT)

  return (
    <section className="map-card query-card" aria-label="Resultados de consulta" aria-live="polite">
      <div className="card-header"><div><h2>Resultados de consulta</h2><p>{query.layer.title}</p></div><button className="icon-button" aria-label="Cerrar resultados" onClick={onClose}><Icon name="close" size={18}/></button></div>
      <div className="query-body">
        {query.status === 'loading' && <p>Consultando GeoServer…</p>}
        {query.status === 'error' && <p role="alert">{query.error}</p>}
        {query.status === 'done' && !features.length && <p>No se encontraron entidades en esta ubicación.</p>}
        {features.length > 0 && <>
          <label className="field entity-select"><span>{features.length === 1 ? '1 entidad' : `${features.length} entidades`}{capped && ' (límite de la consulta)'}</span>
            <select value={selected} onChange={(event) => setSelected(Number(event.target.value))}>{features.map((feature, index) => <option key={`${feature.id}-${index}`} value={index}>{labelOf(feature, index)}</option>)}</select>
          </label>
          {properties.length ? <dl className="attribute-list">{properties.map(([key, value]) => <div key={key}><dt>{key.replaceAll('_', ' ')}</dt><dd>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</dd></div>)}</dl> : <p>La entidad no tiene atributos informados.</p>}
        </>}
      </div>
    </section>
  )
}

export function ObservationForm({ coordinates, onSave, onCancel, saving, error }) {
  function submit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = form.get('name').trim()
    if (!name) {
      const input = event.currentTarget.elements.namedItem('name')
      input.setCustomValidity('Ingresá un nombre.')
      input.reportValidity()
      return
    }
    onSave({ name, category: form.get('category').trim(), description: form.get('description').trim() })
  }

  return (
    <section className="map-card observation-form" aria-label="Nueva observación">
      <div className="card-header"><div><h2>Nueva observación</h2><p>{coordinates}</p></div><button className="icon-button" aria-label="Cerrar observación" onClick={onCancel} disabled={saving}><Icon name="close" size={18}/></button></div>
      <form onSubmit={submit}>
        <fieldset disabled={saving}>
          <label className="field">Nombre<input name="name" required maxLength={100} onInput={(event) => event.currentTarget.setCustomValidity('')} /></label>
          <label className="field">Categoría<input name="category" maxLength={50}/></label>
          <label className="field">Descripción<textarea name="description" rows={3}/></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="form-actions"><button className="text-button" type="button" onClick={onCancel}>Cancelar</button><button className="primary-button" type="submit">{saving ? 'Guardando…' : 'Guardar'}</button></div>
        </fieldset>
      </form>
    </section>
  )
}
