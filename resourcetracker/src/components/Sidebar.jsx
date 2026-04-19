/**
 * Sidebar.jsx — Left panel with tabs: Personell, Utstyr, Vakter, Beredskap
 */
import { useState } from 'react';
import { SIDEBAR_TABS, PERSONNEL_STATUSES, PERSONNEL_ROLES, EQUIPMENT_TYPES, EQUIPMENT_STATUSES, MIN_STAFFING_WARNING } from '../data.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusBadge(value, statusList) {
  const s = statusList.find((x) => x.value === value);
  if (!s) return <span className={`badge badge-grey`}>{value}</span>;
  return <span className={`badge badge-${s.color}`}>{s.label}</span>;
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Personnel tab ─────────────────────────────────────────────────────────────

function PersonnelTab({ personnel, selectedItem, onSelectItem, onAddItem, onDeploy }) {
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filtered = personnel.filter((p) => {
    if (filterRole && p.role !== filterRole) return false;
    if (filterStatus && p.status !== filterStatus) return false;
    return true;
  });

  return (
    <>
      <div className="filter-bar">
        <calcite-select
          scale="s"
          style={{ flex: 1 }}
          onCalciteSelectChange={(e) => setFilterRole(e.target.value === 'alle' ? '' : e.target.value)}
        >
          <calcite-option value="alle">Alle roller</calcite-option>
          {PERSONNEL_ROLES.map((r) => (
            <calcite-option key={r} value={r}>{r}</calcite-option>
          ))}
        </calcite-select>
        <calcite-select
          scale="s"
          style={{ flex: 1 }}
          onCalciteSelectChange={(e) => setFilterStatus(e.target.value === 'alle' ? '' : e.target.value)}
        >
          <calcite-option value="alle">Alle statuser</calcite-option>
          {PERSONNEL_STATUSES.map((s) => (
            <calcite-option key={s.value} value={s.value}>{s.label}</calcite-option>
          ))}
        </calcite-select>
      </div>

      <ul className="resource-list">
        {filtered.map((p) => (
          <li
            key={p.personnel_id}
            className={`resource-item${selectedItem?.personnel_id === p.personnel_id ? ' selected' : ''}`}
            onClick={() => onSelectItem(p)}
          >
            <calcite-icon icon="user" scale="s" style={{ color: '#60a5fa', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="resource-item-name">{p.name}</div>
              <div className="resource-item-sub">{p.role} · {p.unit}</div>
            </div>
            {statusBadge(p.status, PERSONNEL_STATUSES)}
            {p.status === 'available' && (
              <calcite-button
                scale="s"
                appearance="outline"
                onClick={(e) => { e.stopPropagation(); onDeploy(p.personnel_id); }}
                title="Deplorer"
              >
                <calcite-icon icon="send" scale="s" />
              </calcite-button>
            )}
          </li>
        ))}
      </ul>

      <div style={{ padding: '0.75rem', borderTop: '1px solid #0f3460' }}>
        <calcite-button icon-start="plus" width="full" onClick={onAddItem}>
          Legg til personell
        </calcite-button>
      </div>
    </>
  );
}

// ── Equipment tab ─────────────────────────────────────────────────────────────

function EquipmentTab({ equipment, selectedItem, onSelectItem, onAddItem }) {
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filtered = equipment.filter((e) => {
    if (filterType && e.type !== filterType) return false;
    if (filterStatus && e.status !== filterStatus) return false;
    return true;
  });

  return (
    <>
      <div className="filter-bar">
        <calcite-select
          scale="s"
          style={{ flex: 1 }}
          onCalciteSelectChange={(e) => setFilterType(e.target.value === 'alle' ? '' : e.target.value)}
        >
          <calcite-option value="alle">Alle typer</calcite-option>
          {EQUIPMENT_TYPES.map((t) => (
            <calcite-option key={t.value} value={t.value}>{t.label}</calcite-option>
          ))}
        </calcite-select>
        <calcite-select
          scale="s"
          style={{ flex: 1 }}
          onCalciteSelectChange={(e) => setFilterStatus(e.target.value === 'alle' ? '' : e.target.value)}
        >
          <calcite-option value="alle">Alle statuser</calcite-option>
          {EQUIPMENT_STATUSES.map((s) => (
            <calcite-option key={s.value} value={s.value}>{s.label}</calcite-option>
          ))}
        </calcite-select>
      </div>

      <ul className="resource-list">
        {filtered.map((eq) => (
          <li
            key={eq.equipment_id}
            className={`resource-item${selectedItem?.equipment_id === eq.equipment_id ? ' selected' : ''}`}
            onClick={() => onSelectItem(eq)}
          >
            <calcite-icon icon={eq.type === 'vehicle' ? 'car' : eq.type === 'drone' ? 'plane' : eq.type === 'radio' ? 'broadcast' : 'first-aid-kit'} scale="s" style={{ color: '#f59e0b', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="resource-item-name">{eq.name}</div>
              <div className="resource-item-sub">{EQUIPMENT_TYPES.find(t => t.value === eq.type)?.label ?? eq.type}</div>
            </div>
            {statusBadge(eq.status, EQUIPMENT_STATUSES)}
          </li>
        ))}
      </ul>

      <div style={{ padding: '0.75rem', borderTop: '1px solid #0f3460' }}>
        <calcite-button icon-start="plus" width="full" onClick={onAddItem}>
          Legg til utstyr
        </calcite-button>
      </div>
    </>
  );
}

// ── Shifts tab ─────────────────────────────────────────────────────────────────

function ShiftsTab({ shifts, personnel, selectedItem, onSelectItem, onAddItem }) {
  return (
    <>
      <ul className="resource-list">
        {shifts.map((s) => {
          const p = personnel.find((x) => x.personnel_id === s.personnel_id);
          return (
            <li
              key={s.shift_id}
              className={`resource-item${selectedItem?.shift_id === s.shift_id ? ' selected' : ''}`}
              onClick={() => onSelectItem(s)}
            >
              <calcite-icon icon="clock" scale="s" style={{ color: '#a78bfa', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="resource-item-name">{p?.name ?? s.personnel_id}</div>
                <div className="resource-item-sub">{s.operation_name}</div>
                <div className="resource-item-sub">{fmtDate(s.shift_start)} → {fmtDate(s.shift_end)}</div>
              </div>
            </li>
          );
        })}
      </ul>

      <div style={{ padding: '0.75rem', borderTop: '1px solid #0f3460' }}>
        <calcite-button icon-start="plus" width="full" onClick={onAddItem}>
          Legg til vakt
        </calcite-button>
      </div>
    </>
  );
}

// ── Readiness tab ─────────────────────────────────────────────────────────────

function ReadinessTab({ personnel, equipment, shifts }) {
  const availablePersonnel = personnel.filter((p) => p.status === 'available').length;
  const availableEquipment = equipment.filter((e) => e.status === 'available').length;
  const now = new Date();
  const upcomingShifts = shifts.filter((s) => new Date(s.shift_start) > now).length;
  const pctPersonnel = personnel.length ? Math.round((availablePersonnel / personnel.length) * 100) : 0;
  const pctEquipment = equipment.length ? Math.round((availableEquipment / equipment.length) * 100) : 0;

  return (
    <div style={{ overflowY: 'auto', flex: 1, padding: '0.5rem 0' }}>
      {availablePersonnel < MIN_STAFFING_WARNING && (
        <calcite-notice
          kind="danger"
          open
          style={{ margin: '0.75rem 1rem' }}
        >
          <div slot="title">Lav bemanning</div>
          <div slot="message">
            Kun {availablePersonnel} personell tilgjengelig. Minimumsbemanning er {MIN_STAFFING_WARNING}.
          </div>
        </calcite-notice>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{personnel.length}</div>
          <div className="stat-label">Totalt personell</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{pctPersonnel}%</div>
          <div className="stat-label">Tilgjengelig</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{equipment.length}</div>
          <div className="stat-label">Totalt utstyr</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{pctEquipment}%</div>
          <div className="stat-label">Utstyr tilgj.</div>
        </div>
      </div>

      <div style={{ padding: '0 1rem' }}>
        <calcite-notice kind="brand" open>
          <div slot="title">Kommende vakter</div>
          <div slot="message">{upcomingShifts} planlagte vakter</div>
        </calcite-notice>
      </div>

      <div style={{ padding: '1rem' }}>
        <h4 style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Personellstatus
        </h4>
        {PERSONNEL_STATUSES.map((s) => {
          const count = personnel.filter((p) => p.status === s.value).length;
          return (
            <div key={s.value} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0', borderBottom: '1px solid #0f3460' }}>
              {statusBadge(s.value, PERSONNEL_STATUSES)}
              <span style={{ color: '#e0e0e0', fontWeight: 600 }}>{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Sidebar ──────────────────────────────────────────────────────────────

export default function Sidebar({ activeTab, onTabChange, personnel, equipment, shifts, selectedItem, onSelectItem, onAddItem, onDeploy }) {
  return (
    <aside className="sidebar">
      {/* Tab bar */}
      <calcite-tabs layout="center" scale="s">
        <calcite-tab-nav slot="title-group">
          {SIDEBAR_TABS.map((tab) => (
            <calcite-tab-title
              key={tab.id}
              selected={activeTab === tab.id || undefined}
              onCalciteTabsActivate={() => onTabChange(tab.id)}
              icon-start={tab.icon}
            >
              {tab.label}
            </calcite-tab-title>
          ))}
        </calcite-tab-nav>
      </calcite-tabs>

      {/* Tab content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeTab === 'personnel' && (
          <PersonnelTab
            personnel={personnel}
            selectedItem={selectedItem}
            onSelectItem={onSelectItem}
            onAddItem={onAddItem}
            onDeploy={onDeploy}
          />
        )}
        {activeTab === 'equipment' && (
          <EquipmentTab
            equipment={equipment}
            selectedItem={selectedItem}
            onSelectItem={onSelectItem}
            onAddItem={onAddItem}
          />
        )}
        {activeTab === 'shifts' && (
          <ShiftsTab
            shifts={shifts}
            personnel={personnel}
            selectedItem={selectedItem}
            onSelectItem={onSelectItem}
            onAddItem={onAddItem}
          />
        )}
        {activeTab === 'readiness' && (
          <ReadinessTab
            personnel={personnel}
            equipment={equipment}
            shifts={shifts}
          />
        )}
      </div>
    </aside>
  );
}
