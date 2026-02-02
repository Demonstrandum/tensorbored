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
import {createAction, props} from '@ngrx/store';
import {ProfileData, ProfileMetadata, ProfileSource} from '../types';

/**
 * Dispatched when profile list is requested to load from storage.
 */
export const profileListRequested = createAction('[Profile] List Requested');

/**
 * Dispatched when profile list has been loaded from storage.
 */
export const profileListLoaded = createAction(
  '[Profile] List Loaded',
  props<{profiles: ProfileMetadata[]}>()
);

/**
 * Dispatched when a profile is requested to be loaded.
 */
export const profileLoadRequested = createAction(
  '[Profile] Load Requested',
  props<{name: string}>()
);

/**
 * Dispatched when a profile has been successfully loaded.
 */
export const profileLoaded = createAction(
  '[Profile] Loaded',
  props<{profile: ProfileData}>()
);

/**
 * Dispatched when profile loading fails.
 */
export const profileLoadFailed = createAction(
  '[Profile] Load Failed',
  props<{name: string; error: string}>()
);

/**
 * Dispatched when the current state should be saved as a profile.
 */
export const profileSaveRequested = createAction(
  '[Profile] Save Requested',
  props<{name: string}>()
);

/**
 * Dispatched when a profile has been saved successfully.
 */
export const profileSaved = createAction(
  '[Profile] Saved',
  props<{profile: ProfileData}>()
);

/**
 * Dispatched when profile saving fails.
 */
export const profileSaveFailed = createAction(
  '[Profile] Save Failed',
  props<{name: string; error: string}>()
);

/**
 * Dispatched when a profile is requested to be deleted.
 */
export const profileDeleteRequested = createAction(
  '[Profile] Delete Requested',
  props<{name: string}>()
);

/**
 * Dispatched when a profile has been deleted.
 */
export const profileDeleted = createAction(
  '[Profile] Deleted',
  props<{name: string}>()
);

/**
 * Dispatched when a profile is requested to be exported.
 */
export const profileExportRequested = createAction(
  '[Profile] Export Requested',
  props<{name: string}>()
);

/**
 * Dispatched when a profile has been exported.
 */
export const profileExported = createAction(
  '[Profile] Exported',
  props<{name: string; json: string}>()
);

/**
 * Dispatched when a profile is requested to be imported from JSON.
 */
export const profileImportRequested = createAction(
  '[Profile] Import Requested',
  props<{json: string; newName?: string}>()
);

/**
 * Dispatched when a profile has been imported successfully.
 */
export const profileImported = createAction(
  '[Profile] Imported',
  props<{profile: ProfileData}>()
);

/**
 * Dispatched when profile import fails.
 */
export const profileImportFailed = createAction(
  '[Profile] Import Failed',
  props<{error: string}>()
);

/**
 * Dispatched to set a profile as the active profile.
 * This applies the profile's settings to the current state.
 */
export const profileActivated = createAction(
  '[Profile] Activated',
  props<{profile: ProfileData; source?: ProfileSource}>()
);

/**
 * Dispatched when all profiles should be cleared.
 */
export const profilesClearAllRequested = createAction(
  '[Profile] Clear All Requested'
);

/**
 * Dispatched when all profiles have been cleared.
 */
export const profilesClearedAll = createAction('[Profile] Cleared All');

/**
 * Dispatched when the active profile is deactivated/reset.
 */
export const profileDeactivated = createAction('[Profile] Deactivated');

/**
 * Dispatched when default profile should be fetched from backend.
 */
export const defaultProfileFetchRequested = createAction(
  '[Profile] Default Fetch Requested',
  props<{experimentId: string}>()
);

/**
 * Dispatched when default profile has been fetched from backend.
 */
export const defaultProfileFetched = createAction(
  '[Profile] Default Fetched',
  props<{profile: ProfileData | null; experimentId: string}>()
);

/**
 * Dispatched when the profile name should be renamed.
 */
export const profileRenameRequested = createAction(
  '[Profile] Rename Requested',
  props<{oldName: string; newName: string}>()
);

/**
 * Dispatched when a profile has been renamed.
 */
export const profileRenamed = createAction(
  '[Profile] Renamed',
  props<{oldName: string; newName: string; profile: ProfileData}>()
);
