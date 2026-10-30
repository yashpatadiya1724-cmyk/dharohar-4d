// NOAA Solar Position Calculator & Lit-Tier Raycaster
// Conforms to Dharohar 4D PRD Section 5.1

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

export interface SolarCoordinates {
  altitudeDeg: number;
  azimuthDeg: number;
  vector: { x: number; y: number; z: number };
  solarTime: number;
  isDaylight: boolean;
}

/**
 * Calculates solar altitude and azimuth based on NOAA Solar Calculator mathematics.
 * @param latDeg Latitude in decimal degrees (e.g., 23.1667 for Adalaj, Gujarat)
 * @param lonDeg Longitude in decimal degrees (e.g., 72.5800 for Adalaj, Gujarat)
 * @param N Day of year (1-365)
 * @param hourLocal Local time in decimal hours (7.0 - 18.0)
 * @param tzHours Time zone offset (5.5 for IST)
 */
export function sunPosition(
  latDeg: number,
  lonDeg: number,
  N: number,
  hourLocal: number,
  tzHours: number = 5.5
): SolarCoordinates {
  // Fractional year B in radians
  const B = rad((360 / 365) * (N - 81));

  // Equation of Time (EoT) in minutes
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

  // Local Standard Time Meridian (LSTM)
  const lstm = 15 * tzHours; // 82.5 for Indian Standard Time (IST)

  // Time Correction Factor (TC) in minutes
  const tc = 4 * (lonDeg - lstm) + eot;

  // Local Solar Time (LST) in hours
  const solarTime = hourLocal + tc / 60;

  // Hour Angle (H) in radians
  const H = rad(15 * (solarTime - 12));

  // Solar Declination (decl) in radians
  const decl = rad(23.45 * Math.sin(B));

  // Observer latitude in radians
  const phi = rad(latDeg);

  // Solar Altitude (alt)
  const sinAlt = Math.sin(phi) * Math.sin(decl) + Math.cos(phi) * Math.cos(decl) * Math.cos(H);
  const alt = Math.asin(Math.min(1, Math.max(-1, sinAlt)));

  // Solar Azimuth (az) from North (clockwise)
  const cosAz = (Math.sin(decl) - Math.sin(alt) * Math.sin(phi)) / (Math.cos(alt) * Math.cos(phi) || 0.0001);
  let az = Math.acos(Math.min(1, Math.max(-1, cosAz)));

  // If solar hour angle H > 0 (after solar noon), azimuth is in the west
  if (H > 0) {
    az = 2 * Math.PI - az;
  }

  const altDeg = deg(alt);
  const azDeg = deg(az);

  // Three.js Coordinate Vector: x=East, y=Up, z=South (-z=North)
  // x = sin(az) * cos(alt), y = sin(alt), z = -cos(az) * cos(alt)
  const vx = Math.sin(az) * Math.cos(alt);
  const vy = Math.max(0.05, Math.sin(alt)); // keep slightly above horizon for lighting
  const vz = -Math.cos(az) * Math.cos(alt);

  return {
    altitudeDeg: altDeg,
    azimuthDeg: azDeg,
    vector: { x: vx, y: vy, z: vz },
    solarTime,
    isDaylight: altDeg > 0,
  };
}

/**
 * Converts a standard Date object into day of year (1-365).
 */
export function getDayOfYear(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Calculates which subterranean tiers are illuminated by direct sunlight
 * passing through the octagonal aperture shaft.
 * @param altitudeDeg Sun altitude angle (degrees above horizon)
 * @param shaftDiameter Diameter of octagonal aperture (meters)
 * @param totalTiers Number of subterranean tiers (default 5)
 */
export function calculateLitTiers(
  altitudeDeg: number,
  shaftDiameter: number = 6.8,
  totalTiers: number = 5
): { litTiers: number[]; penetrationDepthM: number; description: string } {
  if (altitudeDeg <= 5) {
    return {
      litTiers: [],
      penetrationDepthM: 0,
      description: "Sun below architectural horizon. No subterranean direct light.",
    };
  }

  // Sunlight penetration depth via aperture aspect ratio:
  // tan(altitude) = depth / shaftOpening => depth = shaftOpening * tan(altitude)
  const radAlt = rad(altitudeDeg);
  const penetrationDepthM = shaftDiameter * Math.tan(radAlt);

  // Tier 1: 0 to -4.5m
  // Tier 2: -4.5 to -9m
  // Tier 3: -9 to -14m
  // Tier 4: -14 to -19m
  // Tier 5: -19 to -24.5m (Aquifer cistern)
  const tierThresholds = [4.5, 9.0, 14.0, 19.0, 24.5];
  const litTiers: number[] = [];

  for (let i = 0; i < totalTiers; i++) {
    if (penetrationDepthM >= (i > 0 ? tierThresholds[i - 1] * 0.7 : 0)) {
      litTiers.push(i + 1);
    }
  }

  let description = "";
  if (litTiers.length >= 5) {
    description = "Solar Noon Zenith: Direct sunbeams illuminate bottom aquifer pool (-24.5m).";
  } else if (litTiers.length >= 3) {
    description = `Mid-day ray penetration down to Tier ${Math.max(...litTiers)} pavilion galleries.`;
  } else if (litTiers.length > 0) {
    description = `Low angle light skimming Tier 1 torana gateway and upper niches.`;
  } else {
    description = "Diffuse ambient subterranean illumination.";
  }

  return { litTiers, penetrationDepthM, description };
}
