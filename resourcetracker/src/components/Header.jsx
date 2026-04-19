/**
 * Header.jsx — Top navigation bar with app title, login/logout, export button.
 */
export default function Header({ user, onLogin, onLogout, onExport }) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.6rem 1.25rem',
        background: '#0f3460',
        borderBottom: '2px solid #1d4ed8',
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      {/* App identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
        <calcite-icon icon="layers" scale="m" style={{ color: '#60a5fa' }} />
        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#e0e0e0', letterSpacing: '0.03em' }}>
          ResourceTracker
        </span>
        <calcite-chip
          scale="s"
          style={{ '--calcite-chip-background-color': '#1d4ed8', '--calcite-chip-text-color': '#fff', marginLeft: '0.5rem' }}
        >
          Beredskapsressurser
        </calcite-chip>
      </div>

      {/* Export button */}
      <calcite-button
        icon-start="export"
        scale="s"
        appearance="outline"
        style={{ '--calcite-button-text-color': '#e0e0e0' }}
        onClick={onExport}
      >
        Eksport til Operasjon
      </calcite-button>

      {/* Auth */}
      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <calcite-icon icon="user" scale="s" style={{ color: '#4ade80' }} />
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{user.username}</span>
          <calcite-button
            scale="s"
            appearance="outline"
            kind="danger"
            onClick={onLogout}
          >
            Logg ut
          </calcite-button>
        </div>
      ) : (
        <calcite-button
          icon-start="sign-in"
          scale="s"
          onClick={onLogin}
        >
          Logg inn (ArcGIS)
        </calcite-button>
      )}
    </header>
  );
}
