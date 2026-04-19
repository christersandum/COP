// Shared constants for ResourceTracker

export const PORTAL_URL = 'https://beredskap.maps.arcgis.com';

export const PERSONNEL_STATUSES = [
  { value: 'available', label: 'Tilgjengelig', color: 'green' },
  { value: 'on-duty', label: 'På vakt', color: 'blue' },
  { value: 'off', label: 'Avspasering', color: 'grey' },
  { value: 'sick', label: 'Syk', color: 'red' },
  { value: 'deployed', label: 'Deployert', color: 'yellow' },
];

export const PERSONNEL_ROLES = [
  'Patrulje',
  'Delta',
  'Medisinsk',
  'Etterretning',
  'Kommando',
  'Støtte',
  'Logistikk',
];

export const EQUIPMENT_TYPES = [
  { value: 'vehicle', label: 'Kjøretøy' },
  { value: 'radio', label: 'Radio' },
  { value: 'drone', label: 'Drone' },
  { value: 'medical', label: 'Medisinsk utstyr' },
  { value: 'other', label: 'Annet' },
];

export const EQUIPMENT_STATUSES = [
  { value: 'available', label: 'Tilgjengelig', color: 'green' },
  { value: 'deployed', label: 'Deployert', color: 'yellow' },
  { value: 'maintenance', label: 'Vedlikehold', color: 'red' },
];

export const SIDEBAR_TABS = [
  { id: 'personnel', label: 'Personell', icon: 'users' },
  { id: 'equipment', label: 'Utstyr', icon: 'car' },
  { id: 'shifts', label: 'Vakter', icon: 'clock' },
  { id: 'readiness', label: 'Beredskap', icon: 'graph-bar' },
];

export const RESOURCES_FOLDER = 'OPS/RESOURCES';

export const FEATURE_SERVICE_NAMES = {
  PERSONNEL: 'RES_Personnel',
  EQUIPMENT: 'RES_Equipment',
  SHIFTS: 'RES_Shifts',
  CERTIFICATIONS: 'RES_Certifications',
};

export const MIN_STAFFING_WARNING = 3;
