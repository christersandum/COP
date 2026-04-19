import { useState, useEffect, useCallback } from 'react';
import IdentityManager from '@arcgis/core/identity/IdentityManager.js';
import { PORTAL_URL } from './data.js';
import { SEED_PERSONNEL, SEED_EQUIPMENT, SEED_SHIFTS } from './utils/seedData.js';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import ArcGISMap from './components/ArcGISMap.jsx';
import RightPanel from './components/RightPanel.jsx';
import OperationExport from './components/OperationExport.jsx';

function genId() {
  return 'id-' + Math.random().toString(36).slice(2, 10) + '-' + Date.now().toString(36);
}

export default function App() {
  // ── Auth state ────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // ── Data state (seeded from local data until ArcGIS Online is available) ──
  const [personnel, setPersonnel] = useState(SEED_PERSONNEL);
  const [equipment, setEquipment] = useState(SEED_EQUIPMENT);
  const [shifts, setShifts] = useState(SEED_SHIFTS);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('personnel');
  const [selectedItem, setSelectedItem] = useState(null);
  const [rightPanelMode, setRightPanelMode] = useState(null); // 'add' | 'edit' | null
  const [showExport, setShowExport] = useState(false);

  // ── Check existing login on mount ─────────────────────────────────────────
  useEffect(() => {
    IdentityManager.checkSignInStatus(`${PORTAL_URL}/sharing/rest`)
      .then((credential) => {
        setUser({ username: credential.userId, token: credential.token });
      })
      .catch(() => {
        // Not signed in — run offline with seed data
      })
      .finally(() => setAuthChecked(true));
  }, []);

  const handleLogin = useCallback(async () => {
    try {
      const credential = await IdentityManager.getCredential(
        `${PORTAL_URL}/sharing/rest`,
        { oAuthPopupConfirmation: false }
      );
      setUser({ username: credential.userId, token: credential.token });
    } catch (err) {
      console.error('Login failed:', err);
    }
  }, []);

  const handleLogout = useCallback(() => {
    IdentityManager.destroyCredentials();
    setUser(null);
  }, []);

  // ── CRUD helpers ──────────────────────────────────────────────────────────

  const addPersonnel = useCallback((data) => {
    setPersonnel((prev) => [
      ...prev,
      { ...data, personnel_id: genId(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ]);
  }, []);

  const updatePersonnel = useCallback((id, data) => {
    setPersonnel((prev) =>
      prev.map((p) => (p.personnel_id === id ? { ...p, ...data, updated_at: new Date().toISOString() } : p))
    );
  }, []);

  const deletePersonnel = useCallback((id) => {
    setPersonnel((prev) => prev.filter((p) => p.personnel_id !== id));
    setSelectedItem(null);
    setRightPanelMode(null);
  }, []);

  const addEquipment = useCallback((data) => {
    setEquipment((prev) => [...prev, { ...data, equipment_id: genId() }]);
  }, []);

  const updateEquipment = useCallback((id, data) => {
    setEquipment((prev) =>
      prev.map((e) => (e.equipment_id === id ? { ...e, ...data } : e))
    );
  }, []);

  const deleteEquipment = useCallback((id) => {
    setEquipment((prev) => prev.filter((e) => e.equipment_id !== id));
    setSelectedItem(null);
    setRightPanelMode(null);
  }, []);

  const addShift = useCallback((data) => {
    setShifts((prev) => [...prev, { ...data, shift_id: genId() }]);
  }, []);

  const updateShift = useCallback((id, data) => {
    setShifts((prev) =>
      prev.map((s) => (s.shift_id === id ? { ...s, ...data } : s))
    );
  }, []);

  const deleteShift = useCallback((id) => {
    setShifts((prev) => prev.filter((s) => s.shift_id !== id));
    setSelectedItem(null);
    setRightPanelMode(null);
  }, []);

  const deployPersonnel = useCallback((id) => {
    updatePersonnel(id, { status: 'deployed' });
  }, [updatePersonnel]);

  if (!authChecked) return null;

  return (
    <div className="app-container">
      <Header
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onExport={() => setShowExport(true)}
      />
      <div className="app-body">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          personnel={personnel}
          equipment={equipment}
          shifts={shifts}
          selectedItem={selectedItem}
          onSelectItem={(item) => {
            setSelectedItem(item);
            setRightPanelMode('edit');
          }}
          onAddItem={() => {
            setSelectedItem(null);
            setRightPanelMode('add');
          }}
          onDeploy={deployPersonnel}
        />
        <div className="main-content">
          <ArcGISMap equipment={equipment} user={user} />
        </div>
        {rightPanelMode && (
          <RightPanel
            mode={rightPanelMode}
            activeTab={activeTab}
            selectedItem={selectedItem}
            personnel={personnel}
            onAddPersonnel={addPersonnel}
            onUpdatePersonnel={updatePersonnel}
            onDeletePersonnel={deletePersonnel}
            onAddEquipment={addEquipment}
            onUpdateEquipment={updateEquipment}
            onDeleteEquipment={deleteEquipment}
            onAddShift={addShift}
            onUpdateShift={updateShift}
            onDeleteShift={deleteShift}
            onClose={() => setRightPanelMode(null)}
          />
        )}
      </div>
      {showExport && (
        <OperationExport
          personnel={personnel}
          equipment={equipment}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}
