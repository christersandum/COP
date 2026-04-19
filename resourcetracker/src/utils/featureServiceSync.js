/**
 * featureServiceSync.js — CRUD operations against ArcGIS Online Feature Services
 * for ResourceTracker (Personnel, Equipment, Shifts, Certifications).
 */
import FeatureLayer from '@arcgis/core/layers/FeatureLayer.js';
import { wgs84ToUtm33n } from './coordUtils.js';

/**
 * Fetch all features (or table rows) from a Feature Service URL.
 * @param {string} serviceUrl  - REST endpoint of the layer/table (…/FeatureServer/0)
 * @param {string} token       - ArcGIS Online token
 * @returns {Promise<Array>}   - Array of plain attribute objects
 */
export async function queryAll(serviceUrl, token) {
  const url = `${serviceUrl}/query`;
  const params = new URLSearchParams({
    f: 'json',
    token,
    where: '1=1',
    outFields: '*',
    returnGeometry: 'true',
  });
  const res = await fetch(`${url}?${params}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return (data.features || []).map((f) => ({ ...f.attributes, _geometry: f.geometry }));
}

/**
 * Add a new feature/row to a Feature Service.
 * @param {string} serviceUrl
 * @param {string} token
 * @param {object} attributes  - plain key/value attributes
 * @param {object|null} geometry  - { lat, lng } for point layers, null for tables
 * @returns {Promise<number>}  - new objectId
 */
export async function addFeature(serviceUrl, token, attributes, geometry = null) {
  const url = `${serviceUrl}/addFeatures`;
  const feature = { attributes };

  if (geometry) {
    const { easting, northing } = wgs84ToUtm33n(geometry.lat, geometry.lng);
    feature.geometry = { x: easting, y: northing, spatialReference: { wkid: 25833 } };
  }

  const params = new URLSearchParams({
    f: 'json',
    token,
    features: JSON.stringify([feature]),
  });

  const res = await fetch(url, { method: 'POST', body: params });
  const data = await res.json();
  if (data.addResults?.[0]?.error) throw new Error(data.addResults[0].error.description);
  return data.addResults?.[0]?.objectId;
}

/**
 * Update an existing feature/row by its OBJECTID.
 * @param {string} serviceUrl
 * @param {string} token
 * @param {number} objectId
 * @param {object} attributes
 * @param {object|null} geometry
 */
export async function updateFeature(serviceUrl, token, objectId, attributes, geometry = null) {
  const url = `${serviceUrl}/updateFeatures`;
  const feature = { attributes: { OBJECTID: objectId, ...attributes } };

  if (geometry) {
    const { easting, northing } = wgs84ToUtm33n(geometry.lat, geometry.lng);
    feature.geometry = { x: easting, y: northing, spatialReference: { wkid: 25833 } };
  }

  const params = new URLSearchParams({
    f: 'json',
    token,
    features: JSON.stringify([feature]),
  });

  const res = await fetch(url, { method: 'POST', body: params });
  const data = await res.json();
  if (data.updateResults?.[0]?.error) throw new Error(data.updateResults[0].error.description);
}

/**
 * Delete a feature/row by its OBJECTID.
 * @param {string} serviceUrl
 * @param {string} token
 * @param {number} objectId
 */
export async function deleteFeature(serviceUrl, token, objectId) {
  const url = `${serviceUrl}/deleteFeatures`;
  const params = new URLSearchParams({
    f: 'json',
    token,
    objectIds: String(objectId),
  });

  const res = await fetch(url, { method: 'POST', body: params });
  const data = await res.json();
  if (data.deleteResults?.[0]?.error) throw new Error(data.deleteResults[0].error.description);
}

/**
 * Initialise a FeatureLayer for display on the ArcGIS map.
 * Used by ArcGISMap.jsx to render equipment GPS positions.
 */
export function buildEquipmentLayer(serviceUrl) {
  return new FeatureLayer({
    url: serviceUrl,
    outFields: ['*'],
    popupTemplate: {
      title: '{name}',
      content: [
        {
          type: 'fields',
          fieldInfos: [
            { fieldName: 'type', label: 'Type' },
            { fieldName: 'status', label: 'Status' },
            { fieldName: 'assigned_to', label: 'Tildelt' },
            { fieldName: 'notes', label: 'Notater' },
          ],
        },
      ],
    },
  });
}
