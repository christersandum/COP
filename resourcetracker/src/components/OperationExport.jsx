/**
 * OperationExport.jsx — Dialog to export deployed personnel as operationdashboard JSON.
 */
import { useState } from 'react';

function toOperationUnit(p) {
  return {
    id: p.personnel_id,
    name: p.name,
    type: 'personnel',
    role: p.role,
    unit: p.unit,
    status: 'active',
    phone: p.phone || '',
    email: p.email || '',
    certifications: p.certifications ? p.certifications.split(',').map((c) => c.trim()) : [],
    position: null, // no GPS for personnel in ResourceTracker
    exportedAt: new Date().toISOString(),
  };
}

export default function OperationExport({ personnel, equipment, onClose }) {
  const deployed = personnel.filter((p) => p.status === 'deployed');
  const [operationName, setOperationName] = useState('');

  function handleDownload() {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      operationName: operationName || 'Eksportert operasjon',
      source: 'ResourceTracker',
      units: deployed.map(toOperationUnit),
      equipment: equipment
        .filter((e) => e.status === 'deployed')
        .map((e) => ({
          id: e.equipment_id,
          name: e.name,
          type: e.type,
          status: e.status,
          assignedTo: e.assigned_to,
          gps: e.last_known_lat ? { lat: e.last_known_lat, lng: e.last_known_lng } : null,
          notes: e.notes || '',
        })),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resourcetracker-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  }

  return (
    <calcite-modal open aria-labelledby="export-modal-title" style={{ '--calcite-modal-width': '500px' }}>
      <div slot="header" id="export-modal-title">
        <calcite-icon icon="export" scale="m" style={{ marginRight: '0.5rem' }} />
        Eksporter til operationdashboard
      </div>

      <div slot="content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
        {deployed.length === 0 ? (
          <calcite-notice kind="warning" open>
            <div slot="title">Ingen deployerte</div>
            <div slot="message">
              Marker personell som «deployert» i Personell-fanen for å eksportere dem.
            </div>
          </calcite-notice>
        ) : (
          <>
            <calcite-notice kind="success" open>
              <div slot="title">{deployed.length} personell klar for eksport</div>
              <div slot="message">
                Disse vil bli inkludert som <code>units[]</code> i operationdashboard-formatet.
              </div>
            </calcite-notice>

            <div className="form-row">
              <label>Operasjonsnavn (valgfritt)</label>
              <calcite-input
                scale="s"
                placeholder="f.eks. Operasjon Nordvakt"
                value={operationName}
                onCalciteInputInput={(e) => setOperationName(e.target.value)}
              />
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '200px', overflowY: 'auto' }}>
              {deployed.map((p) => (
                <li key={p.personnel_id} style={{ padding: '0.4rem 0', borderBottom: '1px solid #0f3460', fontSize: '0.9rem', color: '#e0e0e0' }}>
                  <calcite-icon icon="user" scale="s" style={{ marginRight: '0.4rem' }} />
                  {p.name} — <span style={{ color: '#94a3b8' }}>{p.role} · {p.unit}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <calcite-button
        slot="primary"
        icon-start="export"
        disabled={deployed.length === 0 || undefined}
        onClick={handleDownload}
      >
        Last ned JSON
      </calcite-button>
      <calcite-button slot="secondary" appearance="outline" onClick={onClose}>
        Avbryt
      </calcite-button>
    </calcite-modal>
  );
}
