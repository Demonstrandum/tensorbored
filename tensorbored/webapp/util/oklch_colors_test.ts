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
import {
  computeDeconfliction,
  DeconflictionParams,
  hashColorIdToHex,
  hexToOklch,
  fnv1a32,
  oklabDeltaE,
  oklchToHex,
  MIN_DELTA_E,
} from './oklch_colors';

function emptyParams(
  overrides: Partial<DeconflictionParams> = {}
): DeconflictionParams {
  return {
    sortedRunIds: [],
    runIdToBaseColor: new Map(),
    userOverriddenRuns: new Set(),
    darkMode: false,
    cachedDeconflictions: new Map(),
    cachedRunIds: new Set(),
    ...overrides,
  };
}

function allPairsDeltaE(colors: string[]): number {
  let min = Infinity;
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const d = oklabDeltaE(colors[i], colors[j]);
      if (d < min) min = d;
    }
  }
  return min;
}

describe('oklch_colors', () => {
  describe('oklchToHex / hexToOklch round-trip', () => {
    it('produces valid hex strings', () => {
      const hex = oklchToHex(0.65, 0.155, 120);
      expect(hex).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('round-trips approximately', () => {
      const L = 0.7,
        C = 0.12,
        H = 200;
      const hex = oklchToHex(L, C, H);
      const [rL, rC, rH] = hexToOklch(hex);
      expect(rL).toBeCloseTo(L, 1);
      expect(rC).toBeCloseTo(C, 1);
      expect(rH).toBeCloseTo(H, 0);
    });
  });

  describe('oklabDeltaE', () => {
    it('returns 0 for identical colors', () => {
      expect(oklabDeltaE('#ff0000', '#ff0000')).toBe(0);
    });

    it('returns > 0 for different colors', () => {
      expect(oklabDeltaE('#ff0000', '#0000ff')).toBeGreaterThan(0.1);
    });

    it('returns a small value for very similar colors', () => {
      expect(oklabDeltaE('#ff0000', '#fe0101')).toBeLessThan(0.01);
    });
  });

  describe('hashColorIdToHex', () => {
    it('produces different colors for different hashes', () => {
      const a = hashColorIdToHex(fnv1a32('run_a'), false);
      const b = hashColorIdToHex(fnv1a32('run_b'), false);
      expect(a).not.toEqual(b);
    });

    it('produces different lightness for dark vs light mode', () => {
      const hash = fnv1a32('run_x');
      const light = hexToOklch(hashColorIdToHex(hash, false));
      const dark = hexToOklch(hashColorIdToHex(hash, true));
      expect(dark[0]).toBeGreaterThan(light[0]);
    });
  });

  describe('computeDeconfliction', () => {
    describe('basic cases', () => {
      it('returns empty map for no runs', () => {
        const result = computeDeconfliction(emptyParams());
        expect(result.size).toBe(0);
      });

      it('returns empty map for a single run', () => {
        const result = computeDeconfliction(
          emptyParams({
            sortedRunIds: ['run1'],
            runIdToBaseColor: new Map([['run1', '#ff0000']]),
          })
        );
        expect(result.size).toBe(0);
      });

      it('returns empty map when all colors are sufficiently distant', () => {
        const result = computeDeconfliction(
          emptyParams({
            sortedRunIds: ['a', 'b', 'c'],
            runIdToBaseColor: new Map([
              ['a', '#ff0000'],
              ['b', '#00ff00'],
              ['c', '#0000ff'],
            ]),
          })
        );
        expect(result.size).toBe(0);
      });
    });

    describe('clash detection and resolution', () => {
      it('deconflicts two runs with identical colors', () => {
        const result = computeDeconfliction(
          emptyParams({
            sortedRunIds: ['a', 'b'],
            runIdToBaseColor: new Map([
              ['a', '#ff0000'],
              ['b', '#ff0000'],
            ]),
          })
        );

        expect(result.size).toBe(1);
        expect(result.has('b')).toBeTrue();
        expect(result.get('b')).not.toEqual('#ff0000');
      });

      it('deconflicts two runs with very similar colors', () => {
        const result = computeDeconfliction(
          emptyParams({
            sortedRunIds: ['a', 'b'],
            runIdToBaseColor: new Map([
              ['a', '#ff0000'],
              ['b', '#fe0101'],
            ]),
          })
        );

        expect(result.size).toBe(1);
        expect(result.has('b')).toBeTrue();
        const newColor = result.get('b')!;
        expect(oklabDeltaE(newColor, '#ff0000')).toBeGreaterThanOrEqual(
          MIN_DELTA_E
        );
      });

      it('first run in sorted order keeps its color', () => {
        const result = computeDeconfliction(
          emptyParams({
            sortedRunIds: ['a', 'b'],
            runIdToBaseColor: new Map([
              ['a', '#ff0000'],
              ['b', '#ff0000'],
            ]),
          })
        );

        expect(result.has('a')).toBeFalse();
        expect(result.has('b')).toBeTrue();
      });

      it('deconflicts multiple clashing runs to distinct colors', () => {
        const color = '#ff0000';
        const ids = ['a', 'b', 'c', 'd'];
        const result = computeDeconfliction(
          emptyParams({
            sortedRunIds: ids,
            runIdToBaseColor: new Map(ids.map((id) => [id, color])),
          })
        );

        expect(result.size).toBe(3);

        const effectiveColors = ids.map((id) => result.get(id) ?? color);
        const minDist = allPairsDeltaE(effectiveColors);
        expect(minDist).toBeGreaterThanOrEqual(MIN_DELTA_E * 0.95);
      });
    });

    describe('user-overridden runs', () => {
      it('never deconflicts a user-overridden run', () => {
        const result = computeDeconfliction(
          emptyParams({
            sortedRunIds: ['a', 'b'],
            runIdToBaseColor: new Map([
              ['a', '#ff0000'],
              ['b', '#ff0000'],
            ]),
            userOverriddenRuns: new Set(['b']),
          })
        );

        expect(result.has('b')).toBeFalse();
      });

      it('never deconflicts either run when both are user-overridden', () => {
        const result = computeDeconfliction(
          emptyParams({
            sortedRunIds: ['a', 'b'],
            runIdToBaseColor: new Map([
              ['a', '#ff0000'],
              ['b', '#ff0000'],
            ]),
            userOverriddenRuns: new Set(['a', 'b']),
          })
        );

        expect(result.size).toBe(0);
      });

      it('deconflicts a hash-based run that clashes with a user override', () => {
        const result = computeDeconfliction(
          emptyParams({
            sortedRunIds: ['a', 'b'],
            runIdToBaseColor: new Map([
              ['a', '#ff0000'],
              ['b', '#fe0101'],
            ]),
            userOverriddenRuns: new Set(['a']),
          })
        );

        expect(result.has('a')).toBeFalse();
        expect(result.has('b')).toBeTrue();
        expect(oklabDeltaE(result.get('b')!, '#ff0000')).toBeGreaterThanOrEqual(
          MIN_DELTA_E
        );
      });

      it('deconflicts hash run even when user override sorts later', () => {
        const result = computeDeconfliction(
          emptyParams({
            sortedRunIds: ['a_hash', 'z_user'],
            runIdToBaseColor: new Map([
              ['a_hash', '#ff0000'],
              ['z_user', '#fe0101'],
            ]),
            userOverriddenRuns: new Set(['z_user']),
          })
        );

        expect(result.has('z_user')).toBeFalse();
        expect(result.has('a_hash')).toBeTrue();
        expect(
          oklabDeltaE(result.get('a_hash')!, '#fe0101')
        ).toBeGreaterThanOrEqual(MIN_DELTA_E);
      });

      it('user overrides are considered when deconflicting later runs', () => {
        const result = computeDeconfliction(
          emptyParams({
            sortedRunIds: ['a', 'b', 'c'],
            runIdToBaseColor: new Map([
              ['a', '#ff0000'],
              ['b', '#fe0101'],
              ['c', '#fd0202'],
            ]),
            userOverriddenRuns: new Set(['a']),
          })
        );

        expect(result.has('a')).toBeFalse();
        expect(result.has('b')).toBeTrue();
        expect(result.has('c')).toBeTrue();

        const aColor = '#ff0000';
        const bColor = result.get('b')!;
        const cColor = result.get('c')!;
        expect(oklabDeltaE(bColor, aColor)).toBeGreaterThanOrEqual(MIN_DELTA_E);
        expect(oklabDeltaE(cColor, aColor)).toBeGreaterThanOrEqual(MIN_DELTA_E);
        expect(oklabDeltaE(cColor, bColor)).toBeGreaterThanOrEqual(
          MIN_DELTA_E * 0.95
        );
      });
    });

    describe('replacement color quality', () => {
      it('replacement uses all three OKLCH axes (not just hue)', () => {
        const nearlyIdentical: [string, string][] = [];
        for (let i = 0; i < 20; i++) {
          const hue = i * 18;
          nearlyIdentical.push([`r${i}`, oklchToHex(0.65, 0.155, hue % 360)]);
        }
        const result = computeDeconfliction(
          emptyParams({
            sortedRunIds: nearlyIdentical.map(([id]) => id),
            runIdToBaseColor: new Map(nearlyIdentical),
          })
        );

        const effectiveColors = nearlyIdentical.map(
          ([id, base]) => result.get(id) ?? base
        );

        for (const deconflictedHex of result.values()) {
          const [L, C] = hexToOklch(deconflictedHex);
          const isNonDefault =
            Math.abs(L - 0.65) > 0.02 || Math.abs(C - 0.155) > 0.02;
          if (isNonDefault) return;
        }
        fail(
          'All deconflicted colors have default L/C — 3-axis search not working'
        );
      });

      it('produces sRGB-valid hex colors', () => {
        const ids = Array.from({length: 15}, (_, i) => `run${i}`);
        const base = oklchToHex(0.65, 0.155, 30);
        const result = computeDeconfliction(
          emptyParams({
            sortedRunIds: ids,
            runIdToBaseColor: new Map(ids.map((id) => [id, base])),
          })
        );

        for (const hex of result.values()) {
          expect(hex).toMatch(/^#[0-9a-f]{6}$/);
        }
      });
    });

    describe('incremental / cache behavior', () => {
      it('preserves cached deconflictions for known runs', () => {
        const cached = new Map([['b', '#00ff00']]);
        const result = computeDeconfliction(
          emptyParams({
            sortedRunIds: ['a', 'b'],
            runIdToBaseColor: new Map([
              ['a', '#ff0000'],
              ['b', '#ff0000'],
            ]),
            cachedDeconflictions: cached,
            cachedRunIds: new Set(['a', 'b']),
          })
        );

        expect(result.get('b')).toEqual('#00ff00');
      });

      it('checks new runs against cached effective colors', () => {
        const result = computeDeconfliction(
          emptyParams({
            sortedRunIds: ['a', 'b', 'c'],
            runIdToBaseColor: new Map([
              ['a', '#ff0000'],
              ['b', '#ff0000'],
              ['c', '#ff0000'],
            ]),
            cachedDeconflictions: new Map([['b', '#00ff00']]),
            cachedRunIds: new Set(['a', 'b']),
          })
        );

        expect(result.get('b')).toEqual('#00ff00');
        expect(result.has('c')).toBeTrue();

        const cColor = result.get('c')!;
        expect(oklabDeltaE(cColor, '#ff0000')).toBeGreaterThanOrEqual(
          MIN_DELTA_E
        );
        expect(oklabDeltaE(cColor, '#00ff00')).toBeGreaterThanOrEqual(
          MIN_DELTA_E
        );
      });

      it('new run does not clash with cached deconflicted color', () => {
        const cachedBColor = '#00ff00';
        const result = computeDeconfliction(
          emptyParams({
            sortedRunIds: ['a', 'b', 'c'],
            runIdToBaseColor: new Map([
              ['a', '#ff0000'],
              ['b', '#ff0000'],
              ['c', cachedBColor],
            ]),
            cachedDeconflictions: new Map([['b', cachedBColor]]),
            cachedRunIds: new Set(['a', 'b']),
          })
        );

        expect(result.has('c')).toBeTrue();
        const cColor = result.get('c')!;
        expect(oklabDeltaE(cColor, cachedBColor)).toBeGreaterThanOrEqual(
          MIN_DELTA_E
        );
      });

      it('without cache, recomputes from scratch deterministically', () => {
        const params = emptyParams({
          sortedRunIds: ['a', 'b', 'c'],
          runIdToBaseColor: new Map([
            ['a', '#ff0000'],
            ['b', '#ff0000'],
            ['c', '#fe0101'],
          ]),
        });

        const result1 = computeDeconfliction(params);
        const result2 = computeDeconfliction(params);

        expect(Array.from(result1.entries())).toEqual(
          Array.from(result2.entries())
        );
      });
    });

    describe('determinism', () => {
      it('same inputs always produce the same outputs', () => {
        const ids = ['alpha', 'beta', 'gamma', 'delta'];
        const color = '#aa5533';
        const params = emptyParams({
          sortedRunIds: ids,
          runIdToBaseColor: new Map(ids.map((id) => [id, color])),
        });

        const results: string[][] = [];
        for (let i = 0; i < 5; i++) {
          results.push(
            Array.from(computeDeconfliction(params).entries()).flat()
          );
        }

        for (let i = 1; i < results.length; i++) {
          expect(results[i]).toEqual(results[0]);
        }
      });

      it('is independent of Map insertion order', () => {
        const ids = ['z', 'a', 'm'];
        const color = '#663399';

        const result1 = computeDeconfliction(
          emptyParams({
            sortedRunIds: [...ids].sort(),
            runIdToBaseColor: new Map([
              ['z', color],
              ['a', color],
              ['m', color],
            ]),
          })
        );
        const result2 = computeDeconfliction(
          emptyParams({
            sortedRunIds: [...ids].sort(),
            runIdToBaseColor: new Map([
              ['a', color],
              ['m', color],
              ['z', color],
            ]),
          })
        );

        expect(Array.from(result1.entries())).toEqual(
          Array.from(result2.entries())
        );
      });
    });

    describe('dark mode', () => {
      it('produces different deconfliction colors in dark vs light mode', () => {
        const ids = ['a', 'b'];
        const color = '#ff0000';

        const light = computeDeconfliction(
          emptyParams({
            sortedRunIds: ids,
            runIdToBaseColor: new Map(ids.map((id) => [id, color])),
            darkMode: false,
          })
        );
        const dark = computeDeconfliction(
          emptyParams({
            sortedRunIds: ids,
            runIdToBaseColor: new Map(ids.map((id) => [id, color])),
            darkMode: true,
          })
        );

        expect(light.get('b')).not.toEqual(dark.get('b'));
      });
    });

    describe('mixed user-override and hash scenarios', () => {
      it('user override in the middle does not break deconfliction', () => {
        const result = computeDeconfliction(
          emptyParams({
            sortedRunIds: ['a', 'b', 'c'],
            runIdToBaseColor: new Map([
              ['a', '#ff0000'],
              ['b', '#880000'],
              ['c', '#ff0101'],
            ]),
            userOverriddenRuns: new Set(['b']),
          })
        );

        expect(result.has('b')).toBeFalse();

        if (result.has('c')) {
          const cColor = result.get('c')!;
          expect(oklabDeltaE(cColor, '#ff0000')).toBeGreaterThanOrEqual(
            MIN_DELTA_E
          );
          expect(oklabDeltaE(cColor, '#880000')).toBeGreaterThanOrEqual(
            MIN_DELTA_E
          );
        }
      });

      it('deconflicts hash run when it clashes with a later user override', () => {
        const result = computeDeconfliction(
          emptyParams({
            sortedRunIds: ['a_hash', 'b_hash', 'c_user'],
            runIdToBaseColor: new Map([
              ['a_hash', '#ff0000'],
              ['b_hash', '#ff0000'],
              ['c_user', '#ff0000'],
            ]),
            userOverriddenRuns: new Set(['c_user']),
          })
        );

        expect(result.has('c_user')).toBeFalse();
        expect(result.has('b_hash')).toBeTrue();

        const bColor = result.get('b_hash')!;
        expect(oklabDeltaE(bColor, '#ff0000')).toBeGreaterThanOrEqual(
          MIN_DELTA_E
        );
      });
    });

    describe('stress: many runs', () => {
      it('handles 30 runs with identical base colors', () => {
        const ids = Array.from(
          {length: 30},
          (_, i) => `run_${String(i).padStart(2, '0')}`
        );
        const base = '#ff0000';
        const result = computeDeconfliction(
          emptyParams({
            sortedRunIds: ids,
            runIdToBaseColor: new Map(ids.map((id) => [id, base])),
          })
        );

        expect(result.size).toBe(29);
        const effectiveColors = ids.map((id) => result.get(id) ?? base);
        for (const hex of effectiveColors) {
          expect(hex).toMatch(/^#[0-9a-f]{6}$/);
        }
      });

      it('realistic: hash-based colors for 12 runs are all distinct', () => {
        const runNames = [
          'train/loss',
          'train/acc',
          'eval/loss',
          'eval/acc',
          'test/loss',
          'test/acc',
          'baseline/loss',
          'baseline/acc',
          'experiment_v1/loss',
          'experiment_v1/acc',
          'experiment_v2/loss',
          'experiment_v2/acc',
        ];
        const hashes = runNames.map(fnv1a32);
        const colors = hashes.map((h) => hashColorIdToHex(h, false));
        const runIdToBaseColor = new Map(
          runNames.map((name, i) => [name, colors[i]])
        );

        const result = computeDeconfliction(
          emptyParams({
            sortedRunIds: [...runNames].sort(),
            runIdToBaseColor,
          })
        );

        const effective = runNames.map(
          (name, i) => result.get(name) ?? colors[i]
        );
        const minDist = allPairsDeltaE(effective);
        expect(minDist).toBeGreaterThanOrEqual(MIN_DELTA_E * 0.9);
      });
    });
  });
});
