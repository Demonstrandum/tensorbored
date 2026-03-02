/* Copyright 2026 The TensorFlow Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/

/**
 * @fileoverview OKLCH color utilities for generating perceptually uniform,
 * hash-based stable run colors.
 *
 * OKLCH is a perceptually uniform color space where:
 *   L = Lightness (0 = black, 1 = white)
 *   C = Chroma (0 = gray, higher = more saturated)
 *   H = Hue angle in degrees (0-360)
 *
 * We convert OKLCH -> OKLAB -> Linear sRGB -> sRGB -> Hex.
 */

// ---- OKLCH -> Hex conversion ------------------------------------------------

function oklchToOklab(
  L: number,
  C: number,
  H: number
): [number, number, number] {
  const hRad = (H * Math.PI) / 180;
  return [L, C * Math.cos(hRad), C * Math.sin(hRad)];
}

function oklabToLinearSrgb(
  L: number,
  a: number,
  b: number
): [number, number, number] {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

function linearToSrgb(x: number): number {
  if (x <= 0.0031308) return 12.92 * x;
  return 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
}

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

export function oklchToHex(L: number, C: number, H: number): string {
  const [labL, labA, labB] = oklchToOklab(L, C, H);
  const [linR, linG, linB] = oklabToLinearSrgb(labL, labA, labB);
  const r = Math.round(clamp01(linearToSrgb(linR)) * 255);
  const g = Math.round(clamp01(linearToSrgb(linG)) * 255);
  const b = Math.round(clamp01(linearToSrgb(linB)) * 255);
  return (
    '#' +
    r.toString(16).padStart(2, '0') +
    g.toString(16).padStart(2, '0') +
    b.toString(16).padStart(2, '0')
  );
}

// ---- Hex -> OKLCH conversion ------------------------------------------------

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function cbrt(x: number): number {
  return x >= 0 ? Math.pow(x, 1 / 3) : -Math.pow(-x, 1 / 3);
}

export function hexToOklch(hex: string): [number, number, number] {
  const h = hex.startsWith('#') ? hex.slice(1) : hex;
  const rLin = srgbToLinear(parseInt(h.slice(0, 2), 16) / 255);
  const gLin = srgbToLinear(parseInt(h.slice(2, 4), 16) / 255);
  const bLin = srgbToLinear(parseInt(h.slice(4, 6), 16) / 255);

  const l = 0.4122214708 * rLin + 0.5363325363 * gLin + 0.0514459929 * bLin;
  const m = 0.2119034982 * rLin + 0.6806995451 * gLin + 0.1073969566 * bLin;
  const s = 0.0883024619 * rLin + 0.2817188376 * gLin + 0.6299787005 * bLin;

  const l_ = cbrt(l);
  const m_ = cbrt(m);
  const s_ = cbrt(s);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const b = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const C = Math.sqrt(a * a + b * b);
  const H = ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;

  return [L, C, H];
}

// ---- Hash utilities ---------------------------------------------------------

/**
 * 32-bit FNV-1a hash.  Matches the implementation in runs_reducers.ts.
 */
export function fnv1a32(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

// ---- Hash -> hue ------------------------------------------------------------

/**
 * Convert a 32-bit hash value to a hue angle in [0, 360).
 */
export function hashToHue(hash: number): number {
  return (hash / 0x100000000) * 360;
}

// ---- Default color parameters -----------------------------------------------

/** OKLCH lightness for hash-based run colors in light mode. */
const LIGHTNESS_LIGHT = 0.65;

/** OKLCH lightness for hash-based run colors in dark mode. */
const LIGHTNESS_DARK = 0.78;

/** OKLCH chroma for hash-based run colors. */
const CHROMA = 0.155;

// ---- Public API -------------------------------------------------------------

/**
 * Convert a color-ID (full 32-bit FNV hash) to a hex color.
 *
 * If the colorId is in the legacy range 0-6 (old 7-color palette), the
 * caller should fall back to the palette.  All new IDs are > 6.
 */
export function hashColorIdToHex(colorId: number, darkMode: boolean): string {
  const hue = hashToHue(colorId);
  return oklchToHex(darkMode ? LIGHTNESS_DARK : LIGHTNESS_LIGHT, CHROMA, hue);
}

// ---- Hue distance -----------------------------------------------------------

/** Minimum acceptable hue separation between two group colors (degrees). */
export const MIN_HUE_DISTANCE = 18;

/**
 * Circular hue distance in degrees [0, 180].
 */
export function hueDist(hueA: number, hueB: number): number {
  let d = Math.abs(hueA - hueB);
  if (d > 180) d = 360 - d;
  return d;
}

/**
 * Check if a candidate hue is sufficiently far from all hues in `usedHues`.
 */
export function isHueDistant(hue: number, usedHues: number[]): boolean {
  for (const used of usedHues) {
    if (hueDist(hue, used) < MIN_HUE_DISTANCE) return false;
  }
  return true;
}

// ---- OKLAB-based color distance ---------------------------------------------

type Lab = [L: number, a: number, b: number];

function hexToOklab(hex: string): Lab {
  const [L, C, H] = hexToOklch(hex);
  return oklchToOklab(L, C, H) as Lab;
}

function deltaELab(lab1: Lab, lab2: Lab): number {
  const dL = lab1[0] - lab2[0];
  const da = lab1[1] - lab2[1];
  const db = lab1[2] - lab2[2];
  return Math.sqrt(dL * dL + da * da + db * db);
}

/**
 * Compute OKLAB deltaE (Euclidean distance in OKLAB L,a,b space).
 * Values below ~0.075 are hard to reliably distinguish on a chart.
 */
export function oklabDeltaE(hex1: string, hex2: string): number {
  return deltaELab(hexToOklab(hex1), hexToOklab(hex2));
}

/**
 * Minimum acceptable OKLAB delta-E between any two *active* run colors.
 * 0.075 is a conservative threshold that ensures colors are visually
 * distinguishable across lightness, chroma, and hue simultaneously.
 */
export const MIN_DELTA_E = 0.075;

// ---- sRGB gamut check -------------------------------------------------------

function isInSrgbGamut(L: number, C: number, H: number): boolean {
  const [labL, labA, labB] = oklchToOklab(L, C, H);
  const [r, g, b] = oklabToLinearSrgb(labL, labA, labB);
  const lo = -0.003;
  const hi = 1.003;
  return r >= lo && r <= hi && g >= lo && g <= hi && b >= lo && b <= hi;
}

// ---- Three-axis color search ------------------------------------------------

/** Lightness candidates for light-mode deconfliction. */
const LIGHT_LIGHTNESSES = [0.44, 0.51, 0.58, 0.65, 0.72, 0.79];
/** Lightness candidates for dark-mode deconfliction. */
const DARK_LIGHTNESSES = [0.62, 0.68, 0.74, 0.80, 0.86, 0.92];
/** Chroma candidates for deconfliction search. */
const SEARCH_CHROMAS = [0.07, 0.11, 0.155, 0.20];
/** Number of hue steps (5 degree increments). */
const HUE_STEPS = 72;

/**
 * Find a color that is maximally distant (in OKLAB delta-E) from all
 * colors in `otherHexColors`.  Searches across lightness, chroma, and hue
 * to ensure the result is perceptually distinct on all three axes.
 *
 * Returns the hex color with the highest minimum delta-E to any color in
 * the set, or null if no candidates are found.
 */
function findDistantColor(
  otherHexColors: string[],
  darkMode: boolean
): string | null {
  const otherLabs = otherHexColors.map(hexToOklab);
  const lightnesses = darkMode ? DARK_LIGHTNESSES : LIGHT_LIGHTNESSES;

  let bestHex = '';
  let bestMinDist = -1;

  for (const L of lightnesses) {
    for (const C of SEARCH_CHROMAS) {
      for (let step = 0; step < HUE_STEPS; step++) {
        const H = step * 5;
        if (!isInSrgbGamut(L, C, H)) continue;

        const candidateLab = oklchToOklab(L, C, H) as Lab;

        let minDist = Infinity;
        for (let k = 0; k < otherLabs.length; k++) {
          const dist = deltaELab(candidateLab, otherLabs[k]);
          if (dist <= bestMinDist) {
            minDist = -1;
            break;
          }
          if (dist < minDist) minDist = dist;
        }

        if (minDist > bestMinDist) {
          bestMinDist = minDist;
          bestHex = oklchToHex(L, C, H);
        }
      }
    }
  }

  return bestHex || null;
}

// ---- Deconfliction ----------------------------------------------------------

/**
 * Parameters for incremental deconfliction of run colors.
 */
export interface DeconflictionParams {
  /** All run IDs sorted lexicographically. */
  sortedRunIds: string[];
  /** Map from runId to its base color (user override or hash-based). */
  runIdToBaseColor: ReadonlyMap<string, string>;
  /** Set of runIds whose color was explicitly set by the user/profile. */
  userOverriddenRuns: ReadonlySet<string>;
  darkMode: boolean;
  /** Previously computed deconflictions (from cache). */
  cachedDeconflictions: ReadonlyMap<string, string>;
  /** Run IDs that were present when the cache was computed. */
  cachedRunIds: ReadonlySet<string>;
}

/**
 * Compute perceptual deconfliction for a set of run colors.
 *
 * Processes runs in sorted order.  For cached runs whose base color hasn't
 * changed, the existing deconfliction (if any) is preserved.  For new runs,
 * the base color is checked against ALL previously-assigned effective colors
 * (including cached deconflictions) and replaced with a maximally-distant
 * color if too close.
 *
 * User-overridden runs are never deconflicted — their color is respected
 * even if it clashes.
 *
 * Returns a map of runId → deconflicted hex color ONLY for runs whose
 * color was changed.
 */
export function computeDeconfliction(params: DeconflictionParams): Map<string, string> {
  const {
    sortedRunIds,
    runIdToBaseColor,
    userOverriddenRuns,
    darkMode,
    cachedDeconflictions,
    cachedRunIds,
  } = params;

  const deconflictions = new Map<string, string>();
  const assignedColors: string[] = [];
  const assignedLabs: Lab[] = [];

  // Phase 1: Collect effective colors for all cached runs (preserving order).
  for (const runId of sortedRunIds) {
    if (!cachedRunIds.has(runId)) continue;

    const baseColor = runIdToBaseColor.get(runId)!;
    const cached = cachedDeconflictions.get(runId);
    const effective = cached ?? baseColor;

    if (cached) {
      deconflictions.set(runId, cached);
    }
    assignedColors.push(effective);
    assignedLabs.push(hexToOklab(effective));
  }

  // Phase 2: Process new runs against all cached + previously-deconflicted colors.
  for (const runId of sortedRunIds) {
    if (cachedRunIds.has(runId)) continue;

    const baseColor = runIdToBaseColor.get(runId)!;
    const baseLab = hexToOklab(baseColor);

    if (assignedLabs.length === 0 || userOverriddenRuns.has(runId)) {
      assignedColors.push(baseColor);
      assignedLabs.push(baseLab);
      continue;
    }

    let minDist = Infinity;
    for (let k = 0; k < assignedLabs.length; k++) {
      const d = deltaELab(baseLab, assignedLabs[k]);
      if (d < minDist) minDist = d;
    }

    if (minDist >= MIN_DELTA_E) {
      assignedColors.push(baseColor);
      assignedLabs.push(baseLab);
    } else {
      const replacement = findDistantColor(assignedColors, darkMode);
      if (replacement) {
        deconflictions.set(runId, replacement);
        assignedColors.push(replacement);
        assignedLabs.push(hexToOklab(replacement));
      } else {
        assignedColors.push(baseColor);
        assignedLabs.push(baseLab);
      }
    }
  }

  return deconflictions;
}

// ---- Legacy wrapper (kept for backwards compatibility) ----------------------

/**
 * @deprecated Use `computeDeconfliction` instead.
 */
export function resolveColorClashes(
  runIdToColor: ReadonlyMap<string, string>,
  darkMode: boolean
): Map<string, string> {
  const sorted = Array.from(runIdToColor.keys()).sort();
  return computeDeconfliction({
    sortedRunIds: sorted,
    runIdToBaseColor: runIdToColor,
    userOverriddenRuns: new Set<string>(),
    darkMode,
    cachedDeconflictions: new Map<string, string>(),
    cachedRunIds: new Set<string>(),
  });
}
