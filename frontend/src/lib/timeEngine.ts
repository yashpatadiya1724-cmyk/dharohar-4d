// Dharohar 4D Continuous Time-Travel Engine
// Conforms to PRD Section 32.1: Continuous Year Interpolation & Dynamic Weathering Simulation

import { EpochConfig, DHAROHAR_EPOCHS, EpochMaterialParams } from "./epochs";

const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Helper to interpolate hex color strings (#RRGGBB)
function lerpColor(c1: string, c2: string, t: number): string {
  const r1 = parseInt(c1.slice(1, 3), 16);
  const g1 = parseInt(c1.slice(3, 5), 16);
  const b1 = parseInt(c1.slice(5, 7), 16);

  const r2 = parseInt(c2.slice(1, 3), 16);
  const g2 = parseInt(c2.slice(3, 5), 16);
  const b2 = parseInt(c2.slice(5, 7), 16);

  const r = Math.round(lerp(r1, r2, t)).toString(16).padStart(2, "0");
  const g = Math.round(lerp(g1, g2, t)).toString(16).padStart(2, "0");
  const b = Math.round(lerp(b1, b2, t)).toString(16).padStart(2, "0");

  return `#${r}${g}${b}`;
}

export interface ContinuousEpochState {
  year: number;
  closestEpoch: EpochConfig;
  status: "documented" | "inferred" | "conjectural";
  material: EpochMaterialParams;
  waterLevel: number;
  waterClarity: number;
  activeProps: string[];
  evidenceText: string;
}

/**
 * Samples smooth continuous material, weathering parameters, and water levels
 * for any historical year between 1000 AD and 2026 AD.
 */
export function sampleTimeEngine(
  year: number,
  epochs: EpochConfig[] = DHAROHAR_EPOCHS
): ContinuousEpochState {
  const sorted = [...epochs].sort((a, b) => a.year - b.year);

  // Bounds check
  if (year <= sorted[0].year) {
    const e = sorted[0];
    return {
      year,
      closestEpoch: e,
      status: e.status,
      material: { ...e.material },
      waterLevel: e.waterLevel,
      waterClarity: e.waterClarity,
      activeProps: [...e.props],
      evidenceText: e.evidence[0]?.ref || "Solanki Era Documentation",
    };
  }

  if (year >= sorted[sorted.length - 1].year) {
    const e = sorted[sorted.length - 1];
    return {
      year,
      closestEpoch: e,
      status: e.status,
      material: { ...e.material },
      waterLevel: e.waterLevel,
      waterClarity: e.waterClarity,
      activeProps: [...e.props],
      evidenceText: e.evidence[0]?.ref || "ASI National Monument Registry",
    };
  }

  // Find surrounding keyframe epochs
  const idx = sorted.findIndex((x) => x.year > year) - 1;
  const a = sorted[idx];
  const b = sorted[idx + 1];

  const rawT = (year - a.year) / (b.year - a.year);
  const t = smooth(Math.max(0, Math.min(1, rawT)));

  // Interpolate continuous material params
  const interpolatedMaterial: EpochMaterialParams = {
    tint: lerpColor(a.material.tint, b.material.tint, t),
    roughness: lerp(a.material.roughness, b.material.roughness, t),
    normalStrength: lerp(a.material.normalStrength, b.material.normalStrength, t),
    patina: lerp(a.material.patina, b.material.patina, t),
    algae: lerp(a.material.algae, b.material.algae, t),
    silt: lerp(a.material.silt, b.material.silt, t),
    crack: lerp(a.material.crack, b.material.crack, t),
  };

  const waterLevel = lerp(a.waterLevel, b.waterLevel, t);
  const waterClarity = lerp(a.waterClarity, b.waterClarity, t);

  // Active props: nearest keyframe props with fade
  const closestEpoch = t < 0.5 ? a : b;
  const status = rawT === 0 ? a.status : rawT === 1 ? b.status : "inferred";
  const evidenceText = `${closestEpoch.name} (${closestEpoch.year} AD) — ${closestEpoch.evidence[0]?.ref || "Historical Corpus"}`;

  return {
    year,
    closestEpoch,
    status,
    material: interpolatedMaterial,
    waterLevel,
    waterClarity,
    activeProps: closestEpoch.props,
    evidenceText,
  };
}
