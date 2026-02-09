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

/**
 * Compute OKLAB deltaE (Euclidean distance in OKLAB L,a,b space).
 * Values below ~0.04 are hard to distinguish.
 */
export function oklabDeltaE(hex1: string, hex2: string): number {
  const [L1, C1, H1] = hexToOklch(hex1);
  const [L2, C2, H2] = hexToOklch(hex2);
  const [, a1, b1] = oklchToOklab(L1, C1, H1);
  const [, a2, b2] = oklchToOklab(L2, C2, H2);
  const dL = L1 - L2;
  const da = a1 - a2;
  const db = b1 - b2;
  return Math.sqrt(dL * dL + da * da + db * db);
}

/** Minimum acceptable OKLAB delta-E between any two *active* run colors. */
export const MIN_DELTA_E = 0.04;

// ---- Clash resolution -------------------------------------------------------

/**
 * Given a map of runId -> hex color, detect pairs of colors that are too
 * close (OKLAB deltaE < MIN_DELTA_E) and re-assign one of them so that
 * every color is sufficiently distant from every other color.
 *
 * Returns a map of runId -> new hex color ONLY for runs whose colors were
 * changed.  The caller should merge these into the override map.
 */
export function resolveColorClashes(
  runIdToColor: ReadonlyMap<string, string>,
  darkMode: boolean
): Map<string, string> {
  const overrides = new Map<string, string>();
  const entries = Array.from(runIdToColor.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );
  if (entries.length <= 1) return overrides;

  // Working copy of colors.
  const colors = new Map<string, string>(entries);

  for (let i = 0; i < entries.length; i++) {
    const [runIdA] = entries[i];
    const colorA = colors.get(runIdA)!;

    for (let j = i + 1; j < entries.length; j++) {
      const [runIdB] = entries[j];
      const colorB = colors.get(runIdB)!;

      if (oklabDeltaE(colorA, colorB) >= MIN_DELTA_E) continue;

      // Clash detected.  Resolve by shifting runIdB's hue until it's distant
      // from ALL other current colors.
      const otherColors: string[] = [];
      colors.forEach((c, id) => {
        if (id !== runIdB) otherColors.push(c);
      });

      const newColor = findDistantColor(otherColors, darkMode);
      if (newColor) {
        colors.set(runIdB, newColor);
        overrides.set(runIdB, newColor);
      }
    }
  }

  return overrides;
}

function findDistantColor(
  otherColors: string[],
  darkMode: boolean
): string | null {
  const otherOklch = otherColors.map(hexToOklch);
  const otherHues = otherOklch.map(([, , h]) => h);

  let bestHex = '';
  let bestMinDist = -1;

  // Sweep hues at 5-degree increments.
  for (let step = 0; step < 72; step++) {
    const hue = step * 5;
    const L = darkMode ? LIGHTNESS_DARK : LIGHTNESS_LIGHT;
    const candidate = oklchToHex(L, CHROMA, hue);

    let minDist = Infinity;
    for (const otherHue of otherHues) {
      const d = hueDist(hue, otherHue);
      if (d < minDist) minDist = d;
    }

    if (minDist > bestMinDist) {
      bestMinDist = minDist;
      bestHex = candidate;
    }
  }

  return bestHex || null;
}
