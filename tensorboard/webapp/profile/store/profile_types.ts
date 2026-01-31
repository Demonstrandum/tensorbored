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
import {DataLoadState} from '../../types/data';
import {ProfileData, ProfileMetadata} from '../types';

/**
 * Feature key for the profile state in the store.
 */
export const PROFILE_FEATURE_KEY = 'profile';

/**
 * State for profile management.
 */
export interface ProfileState {
  /**
   * List of available profile metadata (names and timestamps).
   */
  availableProfiles: ProfileMetadata[];

  /**
   * Whether the profile list has been loaded.
   */
  profileListLoadState: DataLoadState;

  /**
   * The currently active profile data, or null if none is active.
   */
  activeProfile: ProfileData | null;

  /**
   * The name of the currently active profile, or null if none.
   */
  activeProfileName: string | null;

  /**
   * Whether there are unsaved changes to the active profile.
   */
  hasUnsavedChanges: boolean;

  /**
   * Default profile from the backend, keyed by experiment ID.
   */
  defaultProfiles: Map<string, ProfileData>;

  /**
   * Load state for individual profile loading operations.
   */
  profileLoadState: DataLoadState;

  /**
   * Error message from the last failed operation, if any.
   */
  lastError: string | null;

  /**
   * The last exported JSON string, used for download.
   */
  lastExportedJson: string | null;
}

/**
 * Fragment of application state with the ProfileState.
 */
export interface State {
  [PROFILE_FEATURE_KEY]?: ProfileState;
}
