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
import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {map, catchError} from 'rxjs/operators';
import {TBHttpClient} from '../../webapp_data_source/tb_http_client';
import {
  ProfileData,
  ProfileMetadata,
  SerializedProfile,
  PROFILE_VERSION,
  isValidProfile,
  migrateProfile,
  createEmptyProfile,
} from '../types';

/**
 * Storage key prefix for profiles in localStorage.
 */
const PROFILE_STORAGE_PREFIX = '_tb_profile.';

/**
 * Storage key for the list of profile names.
 */
const PROFILE_INDEX_KEY = '_tb_profiles_index';

/**
 * Storage key for the currently active profile name.
 */
const ACTIVE_PROFILE_KEY = '_tb_active_profile';

/**
 * Maximum number of profiles that can be stored locally.
 */
const MAX_LOCAL_PROFILES = 50;

/**
 * Data source for profile storage and retrieval.
 * Handles both localStorage operations and backend API calls.
 */
@Injectable()
export class ProfileDataSource {
  constructor(private readonly http: TBHttpClient) {}

  /**
   * Saves a profile to localStorage.
   * Updates the profile index and timestamps.
   */
  saveProfile(profile: ProfileData): void {
    const profileToSave: ProfileData = {
      ...profile,
      lastModifiedTimestamp: Date.now(),
    };

    const key = this.getProfileStorageKey(profile.name);
    window.localStorage.setItem(key, JSON.stringify(profileToSave));

    // Update the index
    const index = this.getProfileIndex();
    if (!index.includes(profile.name)) {
      // Enforce max profiles limit
      if (index.length >= MAX_LOCAL_PROFILES) {
        // Remove the oldest profile (first in the list)
        const removedName = index.shift()!;
        window.localStorage.removeItem(this.getProfileStorageKey(removedName));
      }
      index.push(profile.name);
      this.setProfileIndex(index);
    }
  }

  /**
   * Loads a profile from localStorage by name.
   * Returns null if the profile doesn't exist or is invalid.
   */
  loadProfile(name: string): ProfileData | null {
    const key = this.getProfileStorageKey(name);
    const stored = window.localStorage.getItem(key);

    if (!stored) {
      return null;
    }

    try {
      const parsed = JSON.parse(stored) as unknown;
      if (isValidProfile(parsed)) {
        return migrateProfile(parsed);
      }
    } catch {
      // Invalid JSON or profile format
    }

    return null;
  }

  /**
   * Lists all saved profile metadata from localStorage.
   */
  listProfiles(): ProfileMetadata[] {
    const index = this.getProfileIndex();
    const profiles: ProfileMetadata[] = [];

    for (const name of index) {
      const profile = this.loadProfile(name);
      if (profile) {
        profiles.push({
          name: profile.name,
          lastModifiedTimestamp: profile.lastModifiedTimestamp,
        });
      }
    }

    // Sort by last modified (most recent first)
    profiles.sort((a, b) => b.lastModifiedTimestamp - a.lastModifiedTimestamp);

    return profiles;
  }

  /**
   * Deletes a profile from localStorage.
   */
  deleteProfile(name: string): void {
    const key = this.getProfileStorageKey(name);
    window.localStorage.removeItem(key);

    // Update the index
    const index = this.getProfileIndex();
    const filteredIndex = index.filter((n) => n !== name);
    this.setProfileIndex(filteredIndex);

    // If this was the active profile, clear it
    if (this.getActiveProfileName() === name) {
      this.setActiveProfileName(null);
    }
  }

  /**
   * Exports a profile to a JSON string.
   */
  exportProfile(profile: ProfileData): string {
    const serialized: SerializedProfile = {
      version: PROFILE_VERSION,
      data: profile,
    };
    return JSON.stringify(serialized, null, 2);
  }

  /**
   * Imports a profile from a JSON string.
   * Returns the profile data if valid, null otherwise.
   */
  importProfile(json: string): ProfileData | null {
    try {
      const parsed = JSON.parse(json) as unknown;

      // Handle both direct ProfileData and wrapped SerializedProfile formats
      if (isValidProfile(parsed)) {
        return migrateProfile(parsed);
      }

      // Check for SerializedProfile wrapper
      const serialized = parsed as Partial<SerializedProfile>;
      if (
        typeof serialized.version === 'number' &&
        serialized.data &&
        isValidProfile(serialized.data)
      ) {
        return migrateProfile(serialized.data);
      }
    } catch {
      // Invalid JSON
    }

    return null;
  }

  /**
   * Gets the name of the currently active profile.
   */
  getActiveProfileName(): string | null {
    return window.localStorage.getItem(ACTIVE_PROFILE_KEY);
  }

  /**
   * Sets the currently active profile name.
   */
  setActiveProfileName(name: string | null): void {
    if (name) {
      window.localStorage.setItem(ACTIVE_PROFILE_KEY, name);
    } else {
      window.localStorage.removeItem(ACTIVE_PROFILE_KEY);
    }
  }

  /**
   * Fetches the default profile from the backend for a given experiment.
   * The backend can source this from a JSON file in the logdir.
   */
  fetchDefaultProfile(experimentId: string): Observable<ProfileData | null> {
    return this.http
      .get<SerializedProfile>(`/experiment/${experimentId}/data/profile`)
      .pipe(
        map((response) => {
          if (response && response.data && isValidProfile(response.data)) {
            return migrateProfile(response.data);
          }
          return null;
        }),
        catchError(() => of(null))
      );
  }

  /**
   * Checks if a profile name already exists.
   */
  profileExists(name: string): boolean {
    const index = this.getProfileIndex();
    return index.includes(name);
  }

  /**
   * Generates a unique profile name based on the provided base name.
   */
  generateUniqueName(baseName: string): string {
    const index = this.getProfileIndex();
    if (!index.includes(baseName)) {
      return baseName;
    }

    let counter = 1;
    let candidateName = `${baseName} (${counter})`;
    while (index.includes(candidateName)) {
      counter++;
      candidateName = `${baseName} (${counter})`;
    }

    return candidateName;
  }

  /**
   * Clears all profiles from localStorage.
   */
  clearAllProfiles(): void {
    const index = this.getProfileIndex();
    for (const name of index) {
      window.localStorage.removeItem(this.getProfileStorageKey(name));
    }
    this.setProfileIndex([]);
    this.setActiveProfileName(null);
  }

  private getProfileStorageKey(name: string): string {
    return `${PROFILE_STORAGE_PREFIX}${name}`;
  }

  private getProfileIndex(): string[] {
    const stored = window.localStorage.getItem(PROFILE_INDEX_KEY);
    if (!stored) {
      return [];
    }

    try {
      const parsed = JSON.parse(stored) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => typeof item === 'string');
      }
    } catch {
      // Invalid JSON
    }

    return [];
  }

  private setProfileIndex(index: string[]): void {
    window.localStorage.setItem(PROFILE_INDEX_KEY, JSON.stringify(index));
  }
}

export const TEST_ONLY = {
  PROFILE_STORAGE_PREFIX,
  PROFILE_INDEX_KEY,
  ACTIVE_PROFILE_KEY,
  MAX_LOCAL_PROFILES,
};
