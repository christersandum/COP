# ResourceTracker

**Pre/post-operation readiness and resource management app** for Norwegian emergency and tactical operations teams.

ResourceTracker complements [operationdashboard](../operationdashboard/README.md) in a two-app operational suite:

| App | When used | Purpose |
|---|---|---|
| **ResourceTracker** | Before & after operations | Manage who and what is available to deploy |
| **operationdashboard** | During operations | Real-time unit tracking, incidents, missions |

---

## What the app does

- 👮 **Personnel Registry** — track all personnel: name, role, unit, status, certifications
- 🚗 **Equipment / Vehicle Registry** — track vehicles, radios, drones, medical kits with GPS positions on a live ArcGIS map
- 📋 **Shift & Availability Board** — log which personnel are assigned to which operations and when
- 📊 **Readiness Dashboard** — summary stats: % personnel available, % equipment available, upcoming shifts; alert if staffing drops below minimum
- 🔗 **Export to operationdashboard** — download a `.json` file (compatible with operationdashboard's "Last inn operasjon") containing currently deployed personnel as `units[]`

---

## Authentication

Authentication uses **OAuth 2.0** via the [ArcGIS IdentityManager](https://developers.arcgis.com/javascript/latest/api-reference/esri-identity-IdentityManager.html).

| Setting | Value |
|---|---|
| Portal | `https://beredskap.maps.arcgis.com` |
| Redirect URI (local dev) | `http://localhost:5174/resourcetracker/` |
| Redirect URI (GitHub Pages) | `https://christersandum.github.io/resourcetracker/` |
| Env variable | `VITE_ARCGIS_APP_ID` |

Register your app at [beredskap.maps.arcgis.com](https://beredskap.maps.arcgis.com) to get a Client ID.

The app loads fully without login using built-in seed data (offline mode).

---

## Frontend Architecture

| Component | File | Description |
|---|---|---|
| Entry point | `src/main.jsx` | OAuth registration, React root render |
| Root | `src/App.jsx` | Global state, auth, CRUD wiring |
| Header | `src/components/Header.jsx` | Top nav bar, login/logout, export button |
| Sidebar | `src/components/Sidebar.jsx` | 4 tabs: Personnel, Equipment, Shifts, Readiness |
| Map | `src/components/ArcGISMap.jsx` | ArcGIS MapView showing equipment GPS positions |
| Right panel | `src/components/RightPanel.jsx` | Add/edit/delete forms for all resource types |
| Export dialog | `src/components/OperationExport.jsx` | Export deployed resources to operationdashboard JSON |
| Constants | `src/data.js` | Portal URL, status options, role lists, etc. |

### Utilities

| Utility | File | Description |
|---|---|---|
| Seed data | `src/utils/seedData.js` | 8 personnel, 5 equipment, 2 shifts (Norwegian themed) |
| Portal service | `src/utils/portalService.js` | Create RESOURCES folder + Feature Services on ArcGIS Online |
| Feature sync | `src/utils/featureServiceSync.js` | CRUD against ArcGIS Online Feature Service REST API |
| Coord utils | `src/utils/coordUtils.js` | WGS84 ↔ UTM33N (EPSG:25833) coordinate conversion |

---

## Backend Architecture (ArcGIS Online)

On first authenticated save, `portalService.js` creates:

```
<username>/
└── OPS/
    └── RESOURCES/
        ├── RES_Personnel      ← Table (no geometry)
        ├── RES_Equipment      ← Feature Layer (Point, UTM33N / EPSG:25833)
        ├── RES_Shifts         ← Table (no geometry)
        └── RES_Certifications ← Table (no geometry)
```

### Field Definitions

#### RES_Personnel (Table)

| Field | Type | Description |
|---|---|---|
| `personnel_id` | String(50) | Unique ID |
| `name` | String(200) | Full name |
| `role` | String(100) | Role (Patrulje, Delta, etc.) |
| `unit` | String(100) | Unit name |
| `status` | String(50) | available / on-duty / off / sick / deployed |
| `phone` | String(50) | Phone number |
| `email` | String(200) | Email address |
| `certifications` | String(500) | Comma-separated certifications |
| `created_at` | Date | Record created |
| `updated_at` | Date | Record last updated |

#### RES_Equipment (Feature Layer — Point, EPSG:25833)

| Field | Type | Description |
|---|---|---|
| `equipment_id` | String(50) | Unique ID |
| `name` | String(200) | Asset name |
| `type` | String(50) | vehicle / radio / drone / medical / other |
| `status` | String(50) | available / deployed / maintenance |
| `assigned_to` | String(50) | personnel_id of assignee |
| `last_known_lat` | Double | WGS84 latitude |
| `last_known_lng` | Double | WGS84 longitude |
| `notes` | String(500) | Free-text notes |

#### RES_Shifts (Table)

| Field | Type | Description |
|---|---|---|
| `shift_id` | String(50) | Unique ID |
| `personnel_id` | String(50) | References RES_Personnel |
| `operation_name` | String(200) | Name of the operation |
| `shift_start` | Date | Shift start time |
| `shift_end` | Date | Shift end time |
| `notes` | String(500) | Free-text notes |

#### RES_Certifications (Table)

| Field | Type | Description |
|---|---|---|
| `cert_id` | String(50) | Unique ID |
| `personnel_id` | String(50) | References RES_Personnel |
| `cert_name` | String(200) | Certification name |
| `issued_date` | Date | Date issued |
| `expiry_date` | Date | Expiry date |

---

## Offline Mode

The app starts instantly without login using built-in Norwegian seed data:
- **8 personnel** — roles across Patrulje, Delta, Medisinsk, Etterretning, Kommando
- **5 equipment items** — 2 vehicles (GPS near Oslo), 1 drone, 1 radio kit, 1 medical kit
- **2 shifts** — one ongoing, one upcoming

All data is held in React state. Export to JSON works in offline mode. ArcGIS Online sync is activated once the user logs in.

---

## Integration with operationdashboard

The **Export to operationdashboard** button (top-right of the header) opens a dialog that:

1. Lists all personnel currently marked as `deployed`
2. Lets you name the operation
3. Downloads a `.json` file with this structure:

```json
{
  "version": "1.0",
  "exportedAt": "2026-01-01T12:00:00.000Z",
  "operationName": "Operasjon Nordvakt",
  "source": "ResourceTracker",
  "units": [
    {
      "id": "pers-001",
      "name": "Lars Erik Andersen",
      "type": "personnel",
      "role": "Patrulje",
      "unit": "Enhet Alpha",
      "status": "active",
      ...
    }
  ],
  "equipment": [ ... ]
}
```

Load this file in operationdashboard via **"Last inn operasjon"** to pre-populate units.

---

## Setup Instructions

### Local development

```bash
cd resourcetracker
cp .env.example .env
# Edit .env — set VITE_ARCGIS_APP_ID to your ArcGIS Online Client ID
npm install
npm run dev
# App runs at http://localhost:5174/resourcetracker/
```

### Build for production

```bash
npm run build
# Output in dist/
```

### Deploy to GitHub Pages

The app is configured with `base: '/resourcetracker/'` in `vite.config.js`. Ensure your GitHub Pages workflow copies the `dist/` folder to the `resourcetracker/` path of your Pages site.

---

## File Structure

```
resourcetracker/
├── .env.example          # Environment variable template
├── .eslintrc.cjs         # ESLint config (matching operationdashboard)
├── .gitignore
├── index.html            # HTML entry point, Calcite + ArcGIS CSS
├── package.json
├── vite.config.js        # Vite config — base /resourcetracker/, port 5174
├── vitest.config.js      # Vitest config
├── README.md
└── src/
    ├── main.jsx          # Entry — OAuth registration + React root
    ├── App.jsx           # Root component — state, auth, CRUD
    ├── App.css           # Global dark-theme styles
    ├── data.js           # Shared constants
    ├── components/
    │   ├── Header.jsx
    │   ├── Sidebar.jsx
    │   ├── ArcGISMap.jsx
    │   ├── RightPanel.jsx
    │   └── OperationExport.jsx
    └── utils/
        ├── seedData.js
        ├── portalService.js
        ├── featureServiceSync.js
        └── coordUtils.js
```

---

## Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` | ^18.3 | UI library |
| `react-dom` | ^18.3 | React DOM renderer |
| `@arcgis/core` | ^4.32 | ArcGIS Maps SDK for JavaScript |
| `@esri/calcite-components` | ^2.13 | Esri Calcite Design System |
| `@esri/calcite-components-react` | ^2.13 | Calcite React wrappers |
| `vite` | ^5.4 | Build tool |
| `@vitejs/plugin-react` | ^4.3 | Vite React plugin |
| `vitest` | ^2.1 | Unit testing |
| `eslint` | ^8.57 | Linting |
