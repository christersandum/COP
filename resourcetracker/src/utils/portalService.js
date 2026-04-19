/**
 * portalService.js — Create and manage ArcGIS Online folder + Feature Services
 * for ResourceTracker under OPS/RESOURCES
 */
import esriRequest from '@arcgis/core/request.js';
import { PORTAL_URL, FEATURE_SERVICE_NAMES } from '../data.js';

/**
 * Ensure the OPS/RESOURCES folder exists in the user's ArcGIS Online account.
 * Returns the folder id.
 */
export async function ensureResourcesFolder(token, username) {
  const listUrl = `${PORTAL_URL}/sharing/rest/content/users/${username}`;
  const res = await esriRequest(listUrl, {
    query: { f: 'json', token },
    responseType: 'json',
  });

  const folders = res.data?.folders || [];
  let opsFolder = folders.find((f) => f.title === 'OPS');
  if (!opsFolder) {
    opsFolder = await createFolder(token, username, 'OPS');
  }

  const opsItems = await listFolderItems(token, username, opsFolder.id);
  let resFolder = opsItems.find((f) => f.title === 'RESOURCES' && f.type === 'Folder');
  if (!resFolder) {
    resFolder = await createFolder(token, username, 'RESOURCES', opsFolder.id);
  }

  return resFolder.id;
}

async function createFolder(token, username, title, parentFolderId = null) {
  const url = `${PORTAL_URL}/sharing/rest/content/users/${username}/createFolder`;
  const body = { title, f: 'json', token };
  if (parentFolderId) body.parentFolderId = parentFolderId;
  const res = await esriRequest(url, {
    method: 'post',
    body,
    responseType: 'json',
  });
  return res.data?.folder;
}

async function listFolderItems(token, username, folderId) {
  const url = `${PORTAL_URL}/sharing/rest/content/users/${username}/${folderId}`;
  const res = await esriRequest(url, {
    query: { f: 'json', token },
    responseType: 'json',
  });
  return res.data?.items || [];
}

/**
 * Check whether all four ResourceTracker Feature Services already exist in the
 * user's RESOURCES folder.  Returns an object keyed by service name.
 */
export async function checkExistingServices(token, username) {
  const listUrl = `${PORTAL_URL}/sharing/rest/search`;
  const results = {};

  for (const svcName of Object.values(FEATURE_SERVICE_NAMES)) {
    const res = await esriRequest(listUrl, {
      query: {
        f: 'json',
        token,
        q: `title:"${svcName}" AND owner:${username} AND type:"Feature Service"`,
        num: 1,
      },
      responseType: 'json',
    });
    const items = res.data?.results || [];
    results[svcName] = items.length > 0 ? items[0] : null;
  }

  return results;
}

/**
 * Create the RES_Personnel table (no geometry) on ArcGIS Online.
 */
export async function createPersonnelService(token, username, folderId) {
  const serviceDefinition = {
    name: FEATURE_SERVICE_NAMES.PERSONNEL,
    serviceDescription: 'ResourceTracker — Personnel registry',
    hasStaticData: false,
    maxRecordCount: 2000,
    supportedQueryFormats: 'JSON',
    capabilities: 'Query,Editing',
    tables: [
      {
        id: 0,
        name: FEATURE_SERVICE_NAMES.PERSONNEL,
        type: 'Table',
        fields: personnelFields(),
        supportsAppend: true,
      },
    ],
  };
  return createFeatureService(token, username, folderId, serviceDefinition);
}

/**
 * Create the RES_Equipment feature layer (Point, UTM33N / EPSG:25833).
 */
export async function createEquipmentService(token, username, folderId) {
  const serviceDefinition = {
    name: FEATURE_SERVICE_NAMES.EQUIPMENT,
    serviceDescription: 'ResourceTracker — Equipment registry',
    hasStaticData: false,
    maxRecordCount: 2000,
    supportedQueryFormats: 'JSON',
    capabilities: 'Query,Editing',
    layers: [
      {
        id: 0,
        name: FEATURE_SERVICE_NAMES.EQUIPMENT,
        type: 'Feature Layer',
        geometryType: 'esriGeometryPoint',
        spatialReference: { wkid: 25833 },
        fields: equipmentFields(),
        supportsAppend: true,
      },
    ],
  };
  return createFeatureService(token, username, folderId, serviceDefinition);
}

/**
 * Create the RES_Shifts table (no geometry).
 */
export async function createShiftsService(token, username, folderId) {
  const serviceDefinition = {
    name: FEATURE_SERVICE_NAMES.SHIFTS,
    serviceDescription: 'ResourceTracker — Shifts',
    hasStaticData: false,
    maxRecordCount: 2000,
    supportedQueryFormats: 'JSON',
    capabilities: 'Query,Editing',
    tables: [
      {
        id: 0,
        name: FEATURE_SERVICE_NAMES.SHIFTS,
        type: 'Table',
        fields: shiftFields(),
        supportsAppend: true,
      },
    ],
  };
  return createFeatureService(token, username, folderId, serviceDefinition);
}

/**
 * Create the RES_Certifications table (no geometry).
 */
export async function createCertificationsService(token, username, folderId) {
  const serviceDefinition = {
    name: FEATURE_SERVICE_NAMES.CERTIFICATIONS,
    serviceDescription: 'ResourceTracker — Certifications',
    hasStaticData: false,
    maxRecordCount: 2000,
    supportedQueryFormats: 'JSON',
    capabilities: 'Query,Editing',
    tables: [
      {
        id: 0,
        name: FEATURE_SERVICE_NAMES.CERTIFICATIONS,
        type: 'Table',
        fields: certificationFields(),
        supportsAppend: true,
      },
    ],
  };
  return createFeatureService(token, username, folderId, serviceDefinition);
}

async function createFeatureService(token, username, folderId, serviceDefinition) {
  const url = `${PORTAL_URL}/sharing/rest/content/users/${username}/${folderId}/createService`;
  const res = await esriRequest(url, {
    method: 'post',
    body: {
      f: 'json',
      token,
      createParameters: JSON.stringify(serviceDefinition),
      outputType: 'featureService',
    },
    responseType: 'json',
  });
  return res.data;
}

// ── Field definitions ────────────────────────────────────────────────────────

function personnelFields() {
  return [
    { name: 'personnel_id', type: 'esriFieldTypeString', alias: 'Personnel ID', length: 50, nullable: false },
    { name: 'name', type: 'esriFieldTypeString', alias: 'Navn', length: 200 },
    { name: 'role', type: 'esriFieldTypeString', alias: 'Rolle', length: 100 },
    { name: 'unit', type: 'esriFieldTypeString', alias: 'Enhet', length: 100 },
    { name: 'status', type: 'esriFieldTypeString', alias: 'Status', length: 50 },
    { name: 'phone', type: 'esriFieldTypeString', alias: 'Telefon', length: 50 },
    { name: 'email', type: 'esriFieldTypeString', alias: 'E-post', length: 200 },
    { name: 'certifications', type: 'esriFieldTypeString', alias: 'Sertifiseringer', length: 500 },
    { name: 'created_at', type: 'esriFieldTypeDate', alias: 'Opprettet' },
    { name: 'updated_at', type: 'esriFieldTypeDate', alias: 'Oppdatert' },
  ];
}

function equipmentFields() {
  return [
    { name: 'equipment_id', type: 'esriFieldTypeString', alias: 'Utstyr ID', length: 50, nullable: false },
    { name: 'name', type: 'esriFieldTypeString', alias: 'Navn', length: 200 },
    { name: 'type', type: 'esriFieldTypeString', alias: 'Type', length: 50 },
    { name: 'status', type: 'esriFieldTypeString', alias: 'Status', length: 50 },
    { name: 'assigned_to', type: 'esriFieldTypeString', alias: 'Tildelt', length: 50 },
    { name: 'last_known_lat', type: 'esriFieldTypeDouble', alias: 'Siste kjente breddegrad' },
    { name: 'last_known_lng', type: 'esriFieldTypeDouble', alias: 'Siste kjente lengdegrad' },
    { name: 'notes', type: 'esriFieldTypeString', alias: 'Notater', length: 500 },
  ];
}

function shiftFields() {
  return [
    { name: 'shift_id', type: 'esriFieldTypeString', alias: 'Vakt ID', length: 50, nullable: false },
    { name: 'personnel_id', type: 'esriFieldTypeString', alias: 'Personell ID', length: 50 },
    { name: 'operation_name', type: 'esriFieldTypeString', alias: 'Operasjonsnavn', length: 200 },
    { name: 'shift_start', type: 'esriFieldTypeDate', alias: 'Vakt start' },
    { name: 'shift_end', type: 'esriFieldTypeDate', alias: 'Vakt slutt' },
    { name: 'notes', type: 'esriFieldTypeString', alias: 'Notater', length: 500 },
  ];
}

function certificationFields() {
  return [
    { name: 'cert_id', type: 'esriFieldTypeString', alias: 'Sertifikat ID', length: 50, nullable: false },
    { name: 'personnel_id', type: 'esriFieldTypeString', alias: 'Personell ID', length: 50 },
    { name: 'cert_name', type: 'esriFieldTypeString', alias: 'Sertifikatnavn', length: 200 },
    { name: 'issued_date', type: 'esriFieldTypeDate', alias: 'Utstedelsesdato' },
    { name: 'expiry_date', type: 'esriFieldTypeDate', alias: 'Utløpsdato' },
  ];
}
