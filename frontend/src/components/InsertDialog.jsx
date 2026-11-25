import { useState } from 'react';
import { INSERT_LAYER } from '../config.js';

/** Formulario modal para dar de alta una observacion por WFS-T. */
export default function InsertDialog({ draft, onCancel, onSubmit, submitting, error }) {
  const [form, setForm] = useState({ nombre: '', categoria: '', descripcion: '' });

  const update = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.nombre.trim()) return;
    onSubmit(form);
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <form
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="insert-title"
        onSubmit={handleSubmit}
      >
        <h2 id="insert-title">Nueva observacion</h2>
        <p className="muted small">
          Se guarda por WFS-T en la capa editable <code>ign250.{INSERT_LAYER}</code>.
        </p>
        <dl className="coords">
          <dt>Longitud</dt><dd>{draft.lon.toFixed(6)}</dd>
          <dt>Latitud</dt><dd>{draft.lat.toFixed(6)}</dd>
        </dl>

        <label className="field">
          Nombre *
          <input
            required
            autoFocus
            maxLength={100}
            value={form.nombre}
            onChange={update('nombre')}
            placeholder="Ej.: Puente sobre el rio Negro"
          />
        </label>

        <label className="field">
          Categoria
          <input
            list="categorias"
            maxLength={50}
            value={form.categoria}
            onChange={update('categoria')}
            placeholder="Ej.: puente, obra, poblacion"
          />
          <datalist id="categorias">
            <option value="puente" />
            <option value="obra" />
            <option value="poblacion" />
            <option value="hidrografia" />
            <option value="otro" />
          </datalist>
        </label>

        <label className="field">
          Descripcion
          <textarea
            rows={3}
            maxLength={500}
            value={form.descripcion}
            onChange={update('descripcion')}
            placeholder="Detalle de la observacion"
          />
        </label>

        {error && <p className="error">{error}</p>}

        <div className="row-actions">
          <button type="button" onClick={onCancel} disabled={submitting}>Cancelar</button>
          <button type="submit" className="primary" disabled={submitting || !form.nombre.trim()}>
            {submitting ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
