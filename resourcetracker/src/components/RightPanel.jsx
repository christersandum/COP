/**
 * RightPanel.jsx — Add / Edit / Delete panel for Personnel, Equipment, Shifts.
 */
import { useState } from 'react';
import { PERSONNEL_STATUSES, PERSONNEL_ROLES, EQUIPMENT_TYPES, EQUIPMENT_STATUSES } from '../data.js';

// ── Personnel form ────────────────────────────────────────────────────────────

function PersonnelForm({ initial, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({
    name: '',
    role: PERSONNEL_ROLES[0],
    unit: '',
    status: 'available',
    phone: '',
    email: '',
    certifications: '',
    ...initial,
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="form-row">
        <label>Navn</label>
        <calcite-input scale="s" value={form.name} onCalciteInputInput={set('name')} placeholder="Fullt navn" />
      </div>
      <div className="form-row">
        <label>Rolle</label>
        <calcite-select scale="s" onCalciteSelectChange={set('role')}>
          {PERSONNEL_ROLES.map((r) => (
            <calcite-option key={r} value={r} selected={form.role === r || undefined}>{r}</calcite-option>
          ))}
        </calcite-select>
      </div>
      <div className="form-row">
        <label>Enhet</label>
        <calcite-input scale="s" value={form.unit} onCalciteInputInput={set('unit')} placeholder="Enhetsnavn" />
      </div>
      <div className="form-row">
        <label>Status</label>
        <calcite-select scale="s" onCalciteSelectChange={set('status')}>
          {PERSONNEL_STATUSES.map((s) => (
            <calcite-option key={s.value} value={s.value} selected={form.status === s.value || undefined}>{s.label}</calcite-option>
          ))}
        </calcite-select>
      </div>
      <div className="form-row">
        <label>Telefon</label>
        <calcite-input scale="s" type="tel" value={form.phone} onCalciteInputInput={set('phone')} />
      </div>
      <div className="form-row">
        <label>E-post</label>
        <calcite-input scale="s" type="email" value={form.email} onCalciteInputInput={set('email')} />
      </div>
      <div className="form-row">
        <label>Sertifiseringer (kommaseparert)</label>
        <calcite-input scale="s" value={form.certifications} onCalciteInputInput={set('certifications')} />
      </div>
      <calcite-button width="full" onClick={() => onSave(form)}>Lagre</calcite-button>
      {initial && (
        <calcite-button width="full" kind="danger" appearance="outline" onClick={() => onDelete(initial.personnel_id)}>
          Slett
        </calcite-button>
      )}
      <calcite-button width="full" appearance="outline" onClick={onClose}>Avbryt</calcite-button>
    </div>
  );
}

// ── Equipment form ────────────────────────────────────────────────────────────

function EquipmentForm({ initial, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({
    name: '',
    type: 'vehicle',
    status: 'available',
    assigned_to: '',
    last_known_lat: '',
    last_known_lng: '',
    notes: '',
    ...initial,
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="form-row">
        <label>Navn</label>
        <calcite-input scale="s" value={form.name} onCalciteInputInput={set('name')} placeholder="Utstyrsnavn" />
      </div>
      <div className="form-row">
        <label>Type</label>
        <calcite-select scale="s" onCalciteSelectChange={set('type')}>
          {EQUIPMENT_TYPES.map((t) => (
            <calcite-option key={t.value} value={t.value} selected={form.type === t.value || undefined}>{t.label}</calcite-option>
          ))}
        </calcite-select>
      </div>
      <div className="form-row">
        <label>Status</label>
        <calcite-select scale="s" onCalciteSelectChange={set('status')}>
          {EQUIPMENT_STATUSES.map((s) => (
            <calcite-option key={s.value} value={s.value} selected={form.status === s.value || undefined}>{s.label}</calcite-option>
          ))}
        </calcite-select>
      </div>
      <div className="form-row">
        <label>GPS Breddegrad</label>
        <calcite-input scale="s" type="number" value={form.last_known_lat} onCalciteInputInput={set('last_known_lat')} placeholder="59.9139" />
      </div>
      <div className="form-row">
        <label>GPS Lengdegrad</label>
        <calcite-input scale="s" type="number" value={form.last_known_lng} onCalciteInputInput={set('last_known_lng')} placeholder="10.7522" />
      </div>
      <div className="form-row">
        <label>Notater</label>
        <calcite-input scale="s" value={form.notes} onCalciteInputInput={set('notes')} placeholder="Fritekst" />
      </div>
      <calcite-button width="full" onClick={() => onSave(form)}>Lagre</calcite-button>
      {initial && (
        <calcite-button width="full" kind="danger" appearance="outline" onClick={() => onDelete(initial.equipment_id)}>
          Slett
        </calcite-button>
      )}
      <calcite-button width="full" appearance="outline" onClick={onClose}>Avbryt</calcite-button>
    </div>
  );
}

// ── Shift form ────────────────────────────────────────────────────────────────

function ShiftForm({ initial, personnel, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({
    personnel_id: personnel[0]?.personnel_id ?? '',
    operation_name: '',
    shift_start: '',
    shift_end: '',
    notes: '',
    ...initial,
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="form-row">
        <label>Personell</label>
        <calcite-select scale="s" onCalciteSelectChange={set('personnel_id')}>
          {personnel.map((p) => (
            <calcite-option key={p.personnel_id} value={p.personnel_id} selected={form.personnel_id === p.personnel_id || undefined}>
              {p.name}
            </calcite-option>
          ))}
        </calcite-select>
      </div>
      <div className="form-row">
        <label>Operasjonsnavn</label>
        <calcite-input scale="s" value={form.operation_name} onCalciteInputInput={set('operation_name')} placeholder="Operasjonsnavnet" />
      </div>
      <div className="form-row">
        <label>Vakt start (ISO dato)</label>
        <calcite-input scale="s" type="datetime-local" value={form.shift_start?.slice(0, 16) ?? ''} onCalciteInputInput={set('shift_start')} />
      </div>
      <div className="form-row">
        <label>Vakt slutt (ISO dato)</label>
        <calcite-input scale="s" type="datetime-local" value={form.shift_end?.slice(0, 16) ?? ''} onCalciteInputInput={set('shift_end')} />
      </div>
      <div className="form-row">
        <label>Notater</label>
        <calcite-input scale="s" value={form.notes} onCalciteInputInput={set('notes')} placeholder="Fritekst" />
      </div>
      <calcite-button width="full" onClick={() => onSave(form)}>Lagre</calcite-button>
      {initial && (
        <calcite-button width="full" kind="danger" appearance="outline" onClick={() => onDelete(initial.shift_id)}>
          Slett
        </calcite-button>
      )}
      <calcite-button width="full" appearance="outline" onClick={onClose}>Avbryt</calcite-button>
    </div>
  );
}

// ── Main RightPanel ───────────────────────────────────────────────────────────

export default function RightPanel({
  mode,
  activeTab,
  selectedItem,
  personnel,
  onAddPersonnel,
  onUpdatePersonnel,
  onDeletePersonnel,
  onAddEquipment,
  onUpdateEquipment,
  onDeleteEquipment,
  onAddShift,
  onUpdateShift,
  onDeleteShift,
  onClose,
}) {
  const isEdit = mode === 'edit';

  const title =
    activeTab === 'personnel'
      ? isEdit ? 'Rediger personell' : 'Nytt personell'
      : activeTab === 'equipment'
      ? isEdit ? 'Rediger utstyr' : 'Nytt utstyr'
      : isEdit ? 'Rediger vakt' : 'Ny vakt';

  function handleSave(form) {
    if (activeTab === 'personnel') {
      if (isEdit) onUpdatePersonnel(selectedItem.personnel_id, form);
      else onAddPersonnel(form);
    } else if (activeTab === 'equipment') {
      if (isEdit) onUpdateEquipment(selectedItem.equipment_id, form);
      else onAddEquipment(form);
    } else if (activeTab === 'shifts') {
      if (isEdit) onUpdateShift(selectedItem.shift_id, form);
      else onAddShift(form);
    }
    onClose();
  }

  function handleDelete(id) {
    if (activeTab === 'personnel') onDeletePersonnel(id);
    else if (activeTab === 'equipment') onDeleteEquipment(id);
    else if (activeTab === 'shifts') onDeleteShift(id);
  }

  return (
    <aside className="right-panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ color: '#e0e0e0', fontSize: '0.95rem', fontWeight: 600 }}>{title}</h3>
        <calcite-button appearance="transparent" icon-start="x" scale="s" onClick={onClose} />
      </div>

      {activeTab === 'personnel' && (
        <PersonnelForm
          initial={isEdit ? selectedItem : null}
          personnel={personnel}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={onClose}
        />
      )}
      {activeTab === 'equipment' && (
        <EquipmentForm
          initial={isEdit ? selectedItem : null}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={onClose}
        />
      )}
      {(activeTab === 'shifts' || activeTab === 'readiness') && (
        <ShiftForm
          initial={isEdit ? selectedItem : null}
          personnel={personnel}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={onClose}
        />
      )}
    </aside>
  );
}
