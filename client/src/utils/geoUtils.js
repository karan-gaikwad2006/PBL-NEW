/**
 * Utility functions for geographic operations.
 */

const DISTRICT_NAME_ALIASES = {
  Mumbai: 'Mumbai City',
  Aurangabad: 'Chhatrapati Sambhajinagar',
  Osmanabad: 'Dharashiv',
  Ahmadnagar: 'Ahilyanagar',
};

/**
 * Extracts the district name from a GeoJSON feature properties.
 */
function getDistrictName(feature) {
  const sourceName = feature?.properties?.dtname || feature?.properties?.district || feature?.properties?.NAME_2;
  return DISTRICT_NAME_ALIASES[sourceName] || sourceName || 'Unknown district';
}

/**
 * Robust point-in-polygon algorithm for GeoJSON features.
 * Supports Polygon and MultiPolygon.
 */
export function isPointInFeature(lat, lng, feature) {
  const { geometry } = feature;
  if (!geometry) return false;

  const point = [lng, lat]; // GeoJSON uses [lng, lat]

  if (geometry.type === 'Polygon') {
    return isPointInPolygon(point, geometry.coordinates);
  } else if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.some(polygon => isPointInPolygon(point, polygon));
  }

  return false;
}

/**
 * Ray-casting point-in-polygon algorithm.
 * @param {number[]} point [lng, lat]
 * @param {number[][][]} rings Array of rings (outer ring + holes)
 */
function isPointInPolygon(point, rings) {
  // Check outer ring
  if (!isPointInRing(point, rings[0])) return false;

  // Check holes (if any)
  for (let i = 1; i < rings.length; i++) {
    if (isPointInRing(point, rings[i])) return false;
  }

  return true;
}

/**
 * Basic ray-casting algorithm for a single ring.
 */
function isPointInRing(point, ring) {
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Identifies the Maharashtra district for a given set of coordinates.
 * @param {number} lat Latitude
 * @param {number} lng Longitude
 * @param {Object} geoJson The GeoJSON FeatureCollection
 * @returns {string|null} District name or null if not found
 */
export function getDistrictFromCoords(lat, lng, geoJson) {
  if (!geoJson || !geoJson.features) return null;

  for (const feature of geoJson.features) {
    if (isPointInFeature(lat, lng, feature)) {
      return getDistrictName(feature);
    }
  }

  return null;
}

/**
 * Reverse geocodes coordinates to find a locality name using Nominatim.
 * @param {number} lat Latitude
 * @param {number} lng Longitude
 * @returns {Promise<string|null>} Locality name or null
 */
export async function getLocalityFromCoords(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'PoshanSetu/1.0 (contact: info@poshansetu.org)',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const addr = data.address;

    if (!addr) return null;

    // Preference order for locality/city/village
    return (
      addr.village ||
      addr.town ||
      addr.city ||
      addr.municipality ||
      addr.suburb ||
      addr.neighbourhood ||
      addr.hamlet ||
      null
    );
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}
