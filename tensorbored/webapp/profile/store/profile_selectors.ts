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
import {createFeatureSelector, createSelector} from '@ngrx/store';
import {DataLoadState} from '../../types/data';
import {ProfileData, ProfileMetadata} from '../types';
import {PROFILE_FEATURE_KEY, ProfileState} from './profile_types';

const selectProfileState =
  createFeatureSelector<ProfileState>(PROFILE_FEATURE_KEY);

/**
 * Selector for the list of available profiles.
 */
export const getAvailableProfiles = createSelector(
  selectProfileState,
  (state: ProfileState): ProfileMetadata[] => state.availableProfiles
);

/**
 * Selector for whether the profile list is loading.
 */
export const getProfileListLoading = createSelector(
  selectProfileState,
  (state: ProfileState): boolean =>
    state.profileListLoadState === DataLoadState.LOADING
);

/**
 * Selector for whether the profile list has been loaded.
 */
export const getProfileListLoaded = createSelector(
  selectProfileState,
  (state: ProfileState): boolean =>
    state.profileListLoadState === DataLoadState.LOADED
);

/**
 * Selector for the currently active profile.
 */
export const getActiveProfile = createSelector(
  selectProfileState,
  (state: ProfileState): ProfileData | null => state.activeProfile
);

/**
 * Selector for the name of the currently active profile.
 */
export const getActiveProfileName = createSelector(
  selectProfileState,
  (state: ProfileState): string | null => state.activeProfileName
);

/**
 * Selector for whether there are unsaved changes.
 */
export const getHasUnsavedChanges = createSelector(
  selectProfileState,
  (state: ProfileState): boolean => state.hasUnsavedChanges
);

/**
 * Selector for whether a profile is currently loading.
 */
export const getProfileLoading = createSelector(
  selectProfileState,
  (state: ProfileState): boolean =>
    state.profileLoadState === DataLoadState.LOADING
);

/**
 * Selector for the last error message.
 */
export const getLastError = createSelector(
  selectProfileState,
  (state: ProfileState): string | null => state.lastError
);

/**
 * Selector for the last exported JSON string.
 */
export const getLastExportedJson = createSelector(
  selectProfileState,
  (state: ProfileState): string | null => state.lastExportedJson
);

/**
 * Selector for the default profile for a given experiment ID.
 */
export const getDefaultProfile = (experimentId: string) =>
  createSelector(
    selectProfileState,
    (state: ProfileState): ProfileData | null =>
      state.defaultProfiles.get(experimentId) ?? null
  );

/**
 * Selector for all default profiles.
 */
export const getDefaultProfiles = createSelector(
  selectProfileState,
  (state: ProfileState): Map<string, ProfileData> => state.defaultProfiles
);

/**
 * Selector for whether a profile with the given name exists.
 */
export const profileExists = (name: string) =>
  createSelector(selectProfileState, (state: ProfileState): boolean =>
    state.availableProfiles.some((p) => p.name === name)
  );

/**
 * Selector for whether a profile is active.
 */
export const hasActiveProfile = createSelector(
  selectProfileState,
  (state: ProfileState): boolean => state.activeProfile !== null
);
