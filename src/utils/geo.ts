export interface Coordinates {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_MILES = 3958.8;
const FEET_PER_MILE = 5280;

export function calculateDistance(from: Coordinates, to: Coordinates): number {
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLng = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_MILES * c;
}

export function calculateBearing(from: Coordinates, to: Coordinates): number {
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const deltaLng = toRadians(to.longitude - from.longitude);

  const x = Math.sin(deltaLng) * Math.cos(lat2);
  const y =
    Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

  const bearing = toDegrees(Math.atan2(x, y));
  return (bearing + 360) % 360;
}

export function formatDistance(miles: number): string {
  if (miles < 0.1) {
    const feet = Math.round(miles * FEET_PER_MILE);
    return `${feet} ft`;
  }
  if (miles < 10) {
    return `${miles.toFixed(miles < 1 ? 1 : 2)} mi`;
  }
  return `${Math.round(miles)} mi`;
}

const CARDINALS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;
export type Cardinal = (typeof CARDINALS)[number];

export function bearingToCardinal(bearing: number): Cardinal {
  const normalized = ((bearing % 360) + 360) % 360;
  const idx = Math.round(normalized / 45) % 8;
  return CARDINALS[idx];
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}
