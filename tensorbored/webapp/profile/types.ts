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
import {CardUniqueInfo, SuperimposedCardMetadata} from '../metrics/types';
import {GroupByKey} from '../runs/types';

/**
 * Version number for profile serialization format.
 * Increment when making breaking changes to the format.
 */
export const PROFILE_VERSION = 1;

/**
 * Run color assignment entry.
 */
export interface RunColorEntry {
  runId: string;
  color: string;
}

/**
 * Group-based color assignment entry.
 * Used for persistent color assignments based on group keys.
 */
export interface GroupColorEntry {
  groupKey: string;
  colorId: number;
}

export enum RunSelectionEntryType {
  RUN_ID = 'RUN_ID',
  RUN_NAME = 'RUN_NAME',
}

export interface RunSelectionEntry {
  type: RunSelectionEntryType;
  value: string;
  selected: boolean;
}

export type MetricDescriptions = Record<string, string>;

/**
 * GroupBy configuration for profiles.
 */
export interface ProfileGroupBy {
  key: GroupByKey;
  regexString?: string;
}

/**
 * The complete profile data structure.
 * Contains all user customizations for a TensorBoard session.
 */
export interface ProfileData {
  /**
   * Version number for forward compatibility.
   */
  version: number;

  /**
   * User-friendly name for the profile.
   */
  name: string;

  /**
   * Timestamp when the profile was created/last modified.
   */
  lastModifiedTimestamp: number;

  /**
   * Pinned cards (scalars, histograms, images).
   */
  pinnedCards: CardUniqueInfo[];

  /**
   * Custom run color overrides.
   * Maps run IDs to hex color strings.
   */
  runColors: RunColorEntry[];

  /**
   * Group key to color ID mappings for stable color assignment.
   */
  groupColors: GroupColorEntry[];

  /**
   * Superimposed/combined scalar cards.
   */
  superimposedCards: SuperimposedCardMetadata[];

  /**
   * Run selection overrides. If provided, runs not listed are treated as hidden.
   */
  runSelection?: RunSelectionEntry[];

  /**
   * Tag filter text.
   */
  tagFilter: string;

  /**
   * Optional long-form descriptions per metric tag.
   */
  metricDescriptions?: MetricDescriptions;

  /**
   * Run selector regex filter.
   */
  runFilter: string;

  /**
   * Scalar smoothing value (0-0.999).
   */
  smoothing: number;

  /**
   * Run grouping configuration.
   */
  groupBy: ProfileGroupBy | null;
}

/**
 * Metadata for a saved profile (without the full data).
 * Used for listing profiles without loading their full contents.
 */
export interface ProfileMetadata {
  name: string;
  lastModifiedTimestamp: number;
}

/**
 * Serialized profile format for export/import.
 */
export interface SerializedProfile {
  version: number;
  data: ProfileData;
}

/**
 * Source of a profile - either local (user-created) or from backend (default).
 */
export enum ProfileSource {
  LOCAL = 'local',
  BACKEND = 'backend',
}

/**
 * Profile entry with source information.
 */
export interface ProfileEntry {
  metadata: ProfileMetadata;
  source: ProfileSource;
}

/**
 * Creates a new empty profile with default values.
 */
export function createEmptyProfile(name: string): ProfileData {
  return {
    version: PROFILE_VERSION,
    name,
    lastModifiedTimestamp: Date.now(),
    pinnedCards: [],
    runColors: [],
    groupColors: [],
    superimposedCards: [],
    runSelection: [],
    tagFilter: '',
    metricDescriptions: {},
    runFilter: '',
    smoothing: 0.6,
    groupBy: null,
  };
}

/**
 * Validates a profile data object for correctness.
 * Returns true if valid, false otherwise.
 */
export function isValidProfile(data: unknown): data is ProfileData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const profile = data as Partial<ProfileData>;

  // Check required fields
  if (typeof profile.version !== 'number') return false;
  if (typeof profile.name !== 'string') return false;
  if (typeof profile.lastModifiedTimestamp !== 'number') return false;
  if (!Array.isArray(profile.pinnedCards)) return false;
  if (!Array.isArray(profile.runColors)) return false;
  if (!Array.isArray(profile.groupColors)) return false;
  if (!Array.isArray(profile.superimposedCards)) return false;
  if (
    profile.runSelection !== undefined &&
    !Array.isArray(profile.runSelection)
  ) {
    return false;
  }
  if (typeof profile.tagFilter !== 'string') return false;
  if (
    profile.metricDescriptions !== undefined &&
    (typeof profile.metricDescriptions !== 'object' ||
      profile.metricDescriptions === null ||
      Array.isArray(profile.metricDescriptions))
  ) {
    return false;
  }
  if (typeof profile.runFilter !== 'string') return false;
  if (typeof profile.smoothing !== 'number') return false;

  // Validate pinned cards
  for (const card of profile.pinnedCards) {
    if (typeof card.plugin !== 'string' || typeof card.tag !== 'string') {
      return false;
    }
  }

  // Validate run colors
  for (const entry of profile.runColors) {
    if (typeof entry.runId !== 'string' || typeof entry.color !== 'string') {
      return false;
    }
  }

  // Validate group colors
  for (const entry of profile.groupColors) {
    if (
      typeof entry.groupKey !== 'string' ||
      typeof entry.colorId !== 'number'
    ) {
      return false;
    }
  }

  if (profile.runSelection) {
    for (const entry of profile.runSelection) {
      if (
        entry.type !== RunSelectionEntryType.RUN_ID &&
        entry.type !== RunSelectionEntryType.RUN_NAME
      ) {
        return false;
      }
      if (typeof entry.value !== 'string') {
        return false;
      }
      if (typeof entry.selected !== 'boolean') {
        return false;
      }
    }
  }

  if (profile.metricDescriptions) {
    for (const [tag, description] of Object.entries(
      profile.metricDescriptions
    )) {
      if (typeof tag !== 'string' || typeof description !== 'string') {
        return false;
      }
    }
  }

  return true;
}

/**
 * Migrates older profile versions to the current version.
 * Returns the migrated profile data.
 */
export function migrateProfile(data: ProfileData): ProfileData {
  // Currently only version 1 exists, but this function provides
  // a place for future migrations when the schema changes.
  if (!data.runSelection) {
    data.runSelection = [];
  }
  if (data.version === PROFILE_VERSION) {
    return data;
  }

  // Future migration logic would go here.
  // For now, just update the version number.
  return {
    ...data,
    version: PROFILE_VERSION,
  };
}
