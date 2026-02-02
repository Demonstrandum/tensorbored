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
  ProfileData,
  PROFILE_VERSION,
  RunSelectionEntryType,
  createEmptyProfile,
  isValidProfile,
  migrateProfile,
} from './types';

describe('profile types', () => {
  describe('createEmptyProfile', () => {
    it('creates a profile with the given name', () => {
      const profile = createEmptyProfile('Test Profile');

      expect(profile.name).toBe('Test Profile');
      expect(profile.version).toBe(PROFILE_VERSION);
    });

    it('initializes all fields with default values', () => {
      const profile = createEmptyProfile('Test');

      expect(profile.pinnedCards).toEqual([]);
      expect(profile.runColors).toEqual([]);
      expect(profile.groupColors).toEqual([]);
      expect(profile.superimposedCards).toEqual([]);
      expect(profile.runSelection).toEqual([]);
      expect(profile.tagFilter).toBe('');
      expect(profile.runFilter).toBe('');
      expect(profile.smoothing).toBe(0.6);
      expect(profile.groupBy).toBeNull();
    });

    it('sets lastModifiedTimestamp to current time', () => {
      const before = Date.now();
      const profile = createEmptyProfile('Test');
      const after = Date.now();

      expect(profile.lastModifiedTimestamp).toBeGreaterThanOrEqual(before);
      expect(profile.lastModifiedTimestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('isValidProfile', () => {
    it('returns true for a valid profile', () => {
      const profile = createEmptyProfile('Valid');
      expect(isValidProfile(profile)).toBe(true);
    });

    it('returns false for null', () => {
      expect(isValidProfile(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isValidProfile(undefined)).toBe(false);
    });

    it('returns false for non-object', () => {
      expect(isValidProfile('string')).toBe(false);
      expect(isValidProfile(123)).toBe(false);
      expect(isValidProfile([])).toBe(false);
    });

    it('returns false for missing version', () => {
      const profile = createEmptyProfile('Test');
      const invalidProfile = {...profile} as any;
      delete invalidProfile.version;
      expect(isValidProfile(invalidProfile)).toBe(false);
    });

    it('returns false for missing name', () => {
      const profile = createEmptyProfile('Test');
      const invalidProfile = {...profile} as any;
      delete invalidProfile.name;
      expect(isValidProfile(invalidProfile)).toBe(false);
    });

    it('returns false for invalid pinnedCards (not an array)', () => {
      const profile = createEmptyProfile('Test');
      const invalidProfile = {...profile, pinnedCards: 'not an array'} as any;
      expect(isValidProfile(invalidProfile)).toBe(false);
    });

    it('returns false for invalid pinned card (missing plugin)', () => {
      const profile = createEmptyProfile('Test');
      const invalidProfile = {
        ...profile,
        pinnedCards: [{tag: 'test'}],
      } as any;
      expect(isValidProfile(invalidProfile)).toBe(false);
    });

    it('returns false for invalid pinned card (missing tag)', () => {
      const profile = createEmptyProfile('Test');
      const invalidProfile = {
        ...profile,
        pinnedCards: [{plugin: 'scalars'}],
      } as any;
      expect(isValidProfile(invalidProfile)).toBe(false);
    });

    it('returns false for invalid runColors (not an array)', () => {
      const profile = createEmptyProfile('Test');
      const invalidProfile = {...profile, runColors: 'not an array'} as any;
      expect(isValidProfile(invalidProfile)).toBe(false);
    });

    it('returns false for invalid run color entry', () => {
      const profile = createEmptyProfile('Test');
      const invalidProfile = {
        ...profile,
        runColors: [{runId: 'run1'}], // missing color
      } as any;
      expect(isValidProfile(invalidProfile)).toBe(false);
    });

    it('returns false for invalid runSelection (not an array)', () => {
      const profile = createEmptyProfile('Test');
      const invalidProfile = {...profile, runSelection: 'nope'} as any;
      expect(isValidProfile(invalidProfile)).toBe(false);
    });

    it('returns false for invalid runSelection entry', () => {
      const profile = createEmptyProfile('Test');
      const invalidProfile = {
        ...profile,
        runSelection: [{type: 'RUN_ID', value: 'run', selected: 'yes'}],
      } as any;
      expect(isValidProfile(invalidProfile)).toBe(false);
    });

    it('returns false for invalid groupColors (not an array)', () => {
      const profile = createEmptyProfile('Test');
      const invalidProfile = {...profile, groupColors: {}} as any;
      expect(isValidProfile(invalidProfile)).toBe(false);
    });

    it('returns false for invalid group color entry', () => {
      const profile = createEmptyProfile('Test');
      const invalidProfile = {
        ...profile,
        groupColors: [{groupKey: 'key'}], // missing colorId
      } as any;
      expect(isValidProfile(invalidProfile)).toBe(false);
    });

    it('returns true with valid pinned cards', () => {
      const profile = createEmptyProfile('Test');
      profile.pinnedCards = [{plugin: 'scalars', tag: 'loss'}];
      expect(isValidProfile(profile)).toBe(true);
    });

    it('returns true with valid run colors', () => {
      const profile = createEmptyProfile('Test');
      profile.runColors = [{runId: 'run1', color: '#ff0000'}];
      expect(isValidProfile(profile)).toBe(true);
    });

    it('returns true with valid group colors', () => {
      const profile = createEmptyProfile('Test');
      profile.groupColors = [{groupKey: 'key1', colorId: 0}];
      expect(isValidProfile(profile)).toBe(true);
    });

    it('returns true with valid run selection entries', () => {
      const profile = createEmptyProfile('Test');
      profile.runSelection = [
        {type: RunSelectionEntryType.RUN_ID, value: 'exp/run', selected: true},
      ];
      expect(isValidProfile(profile)).toBe(true);
    });
  });

  describe('migrateProfile', () => {
    it('returns the same profile if already at current version', () => {
      const profile = createEmptyProfile('Test');
      const migrated = migrateProfile(profile);

      expect(migrated).toEqual(profile);
    });

    it('updates version number for older profiles', () => {
      const oldProfile = {
        ...createEmptyProfile('Old'),
        version: 0,
      };
      const migrated = migrateProfile(oldProfile);

      expect(migrated.version).toBe(PROFILE_VERSION);
    });

    it('preserves all other fields during migration', () => {
      const oldProfile = {
        ...createEmptyProfile('Old'),
        version: 0,
        tagFilter: 'preserved',
        smoothing: 0.8,
      };
      const migrated = migrateProfile(oldProfile);

      expect(migrated.tagFilter).toBe('preserved');
      expect(migrated.smoothing).toBe(0.8);
    });
  });
});
