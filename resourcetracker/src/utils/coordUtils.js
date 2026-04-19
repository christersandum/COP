/**
 * coordUtils.js — WGS84 ↔ UTM33N (EPSG:25833) conversions
 *
 * Uses a simplified Transverse Mercator projection for UTM zone 33N.
 * Suitable for Norway (approx. 9°–21°E).
 */

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

// UTM33N / WGS84 ellipsoid parameters
const a = 6378137.0;           // semi-major axis (m)
const f = 1 / 298.257223563;   // flattening
const b = a * (1 - f);         // semi-minor axis
const e2 = 1 - (b * b) / (a * a); // eccentricity squared
const k0 = 0.9996;             // scale factor
const lon0 = 15 * DEG_TO_RAD;  // central meridian zone 33 (15°E)
const falseEasting = 500000;
const falseNorthing = 0;

/**
 * Convert WGS84 (lat, lng) to UTM33N (easting, northing).
 * @param {number} lat  - latitude in decimal degrees
 * @param {number} lng  - longitude in decimal degrees
 * @returns {{ easting: number, northing: number }}
 */
export function wgs84ToUtm33n(lat, lng) {
  const phi = lat * DEG_TO_RAD;
  const lam = lng * DEG_TO_RAD;
  const dLam = lam - lon0;

  const N = a / Math.sqrt(1 - e2 * Math.sin(phi) ** 2);
  const T = Math.tan(phi) ** 2;
  const C = (e2 / (1 - e2)) * Math.cos(phi) ** 2;
  const A = Math.cos(phi) * dLam;

  const e4 = e2 * e2;
  const e6 = e4 * e2;
  const M =
    a *
    ((1 - e2 / 4 - (3 * e4) / 64 - (5 * e6) / 256) * phi -
      ((3 * e2) / 8 + (3 * e4) / 32 + (45 * e6) / 1024) * Math.sin(2 * phi) +
      ((15 * e4) / 256 + (45 * e6) / 1024) * Math.sin(4 * phi) -
      ((35 * e6) / 3072) * Math.sin(6 * phi));

  const easting =
    k0 *
      N *
      (A +
        ((1 - T + C) * A ** 3) / 6 +
        ((5 - 18 * T + T ** 2 + 72 * C - 58 * (e2 / (1 - e2))) * A ** 5) /
          120) +
    falseEasting;

  const northing =
    k0 *
    (M +
      N *
        Math.tan(phi) *
        (A ** 2 / 2 +
          ((5 - T + 9 * C + 4 * C ** 2) * A ** 4) / 24 +
          ((61 - 58 * T + T ** 2 + 600 * C - 330 * (e2 / (1 - e2))) * A ** 6) /
            720)) +
    falseNorthing;

  return { easting, northing };
}

/**
 * Convert UTM33N (easting, northing) to WGS84 (lat, lng).
 * @param {number} easting
 * @param {number} northing
 * @returns {{ lat: number, lng: number }}
 */
export function utm33nToWgs84(easting, northing) {
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  const x = easting - falseEasting;
  const y = northing - falseNorthing;
  const M = y / k0;
  const mu = M / (a * (1 - e2 / 4 - (3 * e2 ** 2) / 64 - (5 * e2 ** 3) / 256));

  const phi1 =
    mu +
    ((3 * e1) / 2 - (27 * e1 ** 3) / 32) * Math.sin(2 * mu) +
    ((21 * e1 ** 2) / 16 - (55 * e1 ** 4) / 32) * Math.sin(4 * mu) +
    ((151 * e1 ** 3) / 96) * Math.sin(6 * mu) +
    ((1097 * e1 ** 4) / 512) * Math.sin(8 * mu);

  const N1 = a / Math.sqrt(1 - e2 * Math.sin(phi1) ** 2);
  const T1 = Math.tan(phi1) ** 2;
  const C1 = (e2 / (1 - e2)) * Math.cos(phi1) ** 2;
  const R1 = (a * (1 - e2)) / (1 - e2 * Math.sin(phi1) ** 2) ** 1.5;
  const D = x / (N1 * k0);

  const lat =
    (phi1 -
      ((N1 * Math.tan(phi1)) / R1) *
        (D ** 2 / 2 -
          ((5 + 3 * T1 + 10 * C1 - 4 * C1 ** 2 - 9 * (e2 / (1 - e2))) *
            D ** 4) /
            24 +
          ((61 + 90 * T1 + 298 * C1 + 45 * T1 ** 2 - 252 * (e2 / (1 - e2)) - 3 * C1 ** 2) *
            D ** 6) /
            720)) *
    RAD_TO_DEG;

  const lng =
    (lon0 +
      (D -
        ((1 + 2 * T1 + C1) * D ** 3) / 6 +
        ((5 - 2 * C1 + 28 * T1 - 3 * C1 ** 2 + 8 * (e2 / (1 - e2)) + 24 * T1 ** 2) * D ** 5) /
          120) /
        Math.cos(phi1)) *
    RAD_TO_DEG;

  return { lat, lng };
}
