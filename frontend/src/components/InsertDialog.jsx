import { useState } from 'react';
import { X } from 'lucide-react';
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
        className="modal glass glass--opaque"
        role="dialog"
        aria-modal="true"
        aria-labelledby="insert-title"
        onSubmit={handleSubmit}
      >
        <div className="modal-head">
          <div>
            <h2 id="insert-title" className="modal-title">Nueva observación</h2>
            <p className="modal-sub">
              Se guarda por WFS-T en la capa editable <code>ign250.{INSERT_LAYER}</code>.
            </p>
          </div>
          <button type="button" className="icon-btn" onClick={onCancel} aria-label="Cerrar">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <dl className="coords">
          <dt>Longitud</dt>
          <dd>{draft.lon.toFixed(6)}</dd>
          <dt>Latitud</dt>
          <dd>{draft.lat.toFixed(6)}</dd>
        </dl>

        <label className="field">
          Nombre *
          <input
            required
            autoFocus
            maxLength={100}
            value={form.nombre}
            onChange={update('nombre')}
            placeholder="Ej.: Puente sobre el río Negro"
          />
        </label>

        <label className="field">
          Categoría
          <input
            list="categorias"
            maxLength={50}
            value={form.categoria}
            onChange={update('categoria')}
            placeholder="Ej.: puente, obra, población"
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
          Descripción
          <textarea
            rows={3}
            maxLength={500}
            value={form.descripcion}
            onChange={update('descripcion')}
            placeholder="Detalle de la observación"
          />
        </label>

        {error && <p className="error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={submitting}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary" disabled={submitting || !form.nombre.trim()}>
            {submitting ? 'Guardando…' : 'Guardar observación'}
          </button>
        </div>
      </form>
    </div>
  );
}
