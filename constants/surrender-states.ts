// constants/surrender-states.ts

export type SurrenderQuadrant =
  | 'HIGH_UNPLEASANT'
  | 'HIGH_PLEASANT'
  | 'LOW_UNPLEASANT'
  | 'LOW_PLEASANT';

/**
 * Corner colours for the 2D gradient grid.
 * Layout:
 *   TOP-LEFT (high energy, unpleasant) = RED
 *   TOP-RIGHT (high energy, pleasant)  = YELLOW
 *   BOT-LEFT (low energy, unpleasant)  = PURPLE
 *   BOT-RIGHT (low energy, pleasant)   = GREEN
 */
export const GRID_CORNER_COLORS = {
  topLeft: '#FF006E',     // HIGH_UNPLEASANT
  topRight: '#FFD60A',    // HIGH_PLEASANT
  bottomLeft: '#8B5CF6',  // LOW_UNPLEASANT
  bottomRight: '#00FF94', // LOW_PLEASANT
} as const;

/** Solid accent colour used for UI elements (dot, chips) per quadrant */
export const QUADRANT_ACCENT: Record<SurrenderQuadrant, string> = {
  HIGH_UNPLEASANT: '#FF006E',
  HIGH_PLEASANT:   '#FFD60A',
  LOW_UNPLEASANT:  '#8B5CF6',
  LOW_PLEASANT:    '#00FF94',
};

/** Emotion words surfaced after the user taps a region */
export const QUADRANT_EMOTIONS: Record<SurrenderQuadrant, string[]> = {
  HIGH_UNPLEASANT: ['Anxious', 'Restless', 'Overwhelmed', 'Stressed', 'Panicked'],
  HIGH_PLEASANT:   ['Excited', 'Craving', 'Pumped', 'Wanting more', 'Celebratory'],
  LOW_UNPLEASANT:  ['Lonely', 'Empty', 'Hopeless', 'Numb', 'Disconnected'],
  LOW_PLEASANT:    ['Bored', 'Flat', 'Drifting', 'Zoned out', 'Checked out'],
};

/**
 * Maps a tap position (as a percentage of container width/height) to a quadrant.
 * x: 0 = left (unpleasant), 1 = right (pleasant)
 * y: 0 = top (high energy), 1 = bottom (low energy)
 */
export function positionToQuadrant(xPct: number, yPct: number): SurrenderQuadrant {
  const pleasant = xPct >= 0.5;
  const highEnergy = yPct < 0.5;
  if (highEnergy && !pleasant) return 'HIGH_UNPLEASANT';
  if (highEnergy && pleasant)  return 'HIGH_PLEASANT';
  if (!highEnergy && !pleasant) return 'LOW_UNPLEASANT';
  return 'LOW_PLEASANT';
}

/**
 * Linearly interpolates between two hex colours.
 * t = 0 returns colorA, t = 1 returns colorB.
 */
export function lerpColor(colorA: string, colorB: string, t: number): string {
  const parse = (c: string) => ({
    r: parseInt(c.slice(1, 3), 16),
    g: parseInt(c.slice(3, 5), 16),
    b: parseInt(c.slice(5, 7), 16),
  });
  const a = parse(colorA);
  const b = parse(colorB);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bv = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r},${g},${bv})`;
}

/** Default fallback if the user makes no selection (statistically dominant state) */
export const DEFAULT_QUADRANT: SurrenderQuadrant = 'LOW_UNPLEASANT';
export const DEFAULT_EMOTION = 'Lonely';
