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
import {ActionReducer, createReducer, on} from '@ngrx/store';
import {DataLoadState} from '../../types/data';
import * as profileActions from '../actions/profile_actions';
import {ProfileState} from './profile_types';

const initialState: ProfileState = {
  availableProfiles: [],
  profileListLoadState: DataLoadState.NOT_LOADED,
  activeProfile: null,
  activeProfileName: null,
  hasUnsavedChanges: false,
  defaultProfiles: new Map(),
  profileLoadState: DataLoadState.NOT_LOADED,
  lastError: null,
  lastExportedJson: null,
};

export const reducer: ActionReducer<ProfileState> = createReducer(
  initialState,

  on(profileActions.profileListRequested, (state) => ({
    ...state,
    profileListLoadState: DataLoadState.LOADING,
  })),

  on(profileActions.profileListLoaded, (state, {profiles}) => ({
    ...state,
    availableProfiles: profiles,
    profileListLoadState: DataLoadState.LOADED,
    lastError: null,
  })),

  on(profileActions.profileLoadRequested, (state) => ({
    ...state,
    profileLoadState: DataLoadState.LOADING,
  })),

  on(profileActions.profileLoaded, (state, {profile}) => ({
    ...state,
    activeProfile: profile,
    activeProfileName: profile.name,
    hasUnsavedChanges: false,
    profileLoadState: DataLoadState.LOADED,
    lastError: null,
  })),

  on(profileActions.profileLoadFailed, (state, {error}) => ({
    ...state,
    profileLoadState: DataLoadState.FAILED,
    lastError: error,
  })),

  on(profileActions.profileSaved, (state, {profile}) => {
    const existingIndex = state.availableProfiles.findIndex(
      (p) => p.name === profile.name
    );
    let updatedProfiles: typeof state.availableProfiles;

    if (existingIndex >= 0) {
      // Update existing profile metadata
      updatedProfiles = [...state.availableProfiles];
      updatedProfiles[existingIndex] = {
        name: profile.name,
        lastModifiedTimestamp: profile.lastModifiedTimestamp,
      };
    } else {
      // Add new profile
      updatedProfiles = [
        ...state.availableProfiles,
        {
          name: profile.name,
          lastModifiedTimestamp: profile.lastModifiedTimestamp,
        },
      ];
    }

    // Sort by timestamp (most recent first)
    updatedProfiles.sort(
      (a, b) => b.lastModifiedTimestamp - a.lastModifiedTimestamp
    );

    return {
      ...state,
      availableProfiles: updatedProfiles,
      activeProfile: profile,
      activeProfileName: profile.name,
      hasUnsavedChanges: false,
      lastError: null,
    };
  }),

  on(profileActions.profileSaveFailed, (state, {error}) => ({
    ...state,
    lastError: error,
  })),

  on(profileActions.profileDeleted, (state, {name}) => ({
    ...state,
    availableProfiles: state.availableProfiles.filter((p) => p.name !== name),
    activeProfile:
      state.activeProfileName === name ? null : state.activeProfile,
    activeProfileName:
      state.activeProfileName === name ? null : state.activeProfileName,
    hasUnsavedChanges:
      state.activeProfileName === name ? false : state.hasUnsavedChanges,
    lastError: null,
  })),

  on(profileActions.profileExported, (state, {json}) => ({
    ...state,
    lastExportedJson: json,
  })),

  on(profileActions.profileImported, (state, {profile}) => {
    const existingIndex = state.availableProfiles.findIndex(
      (p) => p.name === profile.name
    );
    let updatedProfiles: typeof state.availableProfiles;

    if (existingIndex >= 0) {
      updatedProfiles = [...state.availableProfiles];
      updatedProfiles[existingIndex] = {
        name: profile.name,
        lastModifiedTimestamp: profile.lastModifiedTimestamp,
      };
    } else {
      updatedProfiles = [
        ...state.availableProfiles,
        {
          name: profile.name,
          lastModifiedTimestamp: profile.lastModifiedTimestamp,
        },
      ];
    }

    updatedProfiles.sort(
      (a, b) => b.lastModifiedTimestamp - a.lastModifiedTimestamp
    );

    return {
      ...state,
      availableProfiles: updatedProfiles,
      lastError: null,
    };
  }),

  on(profileActions.profileImportFailed, (state, {error}) => ({
    ...state,
    lastError: error,
  })),

  on(profileActions.profileActivated, (state, {profile}) => ({
    ...state,
    activeProfile: profile,
    activeProfileName: profile.name,
    hasUnsavedChanges: false,
  })),

  on(profileActions.profileDeactivated, (state) => ({
    ...state,
    activeProfile: null,
    activeProfileName: null,
    hasUnsavedChanges: false,
  })),

  on(profileActions.profilesClearedAll, (state) => ({
    ...state,
    availableProfiles: [],
    activeProfile: null,
    activeProfileName: null,
    hasUnsavedChanges: false,
    lastError: null,
  })),

  on(profileActions.defaultProfileFetched, (state, {profile, experimentId}) => {
    if (!profile) {
      return state;
    }

    const newDefaultProfiles = new Map(state.defaultProfiles);
    newDefaultProfiles.set(experimentId, profile);

    return {
      ...state,
      defaultProfiles: newDefaultProfiles,
    };
  }),

  on(profileActions.profileRenamed, (state, {oldName, newName, profile}) => {
    const updatedProfiles = state.availableProfiles
      .filter((p) => p.name !== oldName)
      .concat({
        name: newName,
        lastModifiedTimestamp: profile.lastModifiedTimestamp,
      });

    updatedProfiles.sort(
      (a, b) => b.lastModifiedTimestamp - a.lastModifiedTimestamp
    );

    return {
      ...state,
      availableProfiles: updatedProfiles,
      activeProfile:
        state.activeProfileName === oldName ? profile : state.activeProfile,
      activeProfileName:
        state.activeProfileName === oldName ? newName : state.activeProfileName,
    };
  })
);

/**
 * Call this function to mark that there are unsaved changes.
 * This should be dispatched when any profile-tracked state changes
 * after a profile is loaded.
 */
export function markUnsavedChanges(state: ProfileState): ProfileState {
  if (!state.activeProfile) {
    return state;
  }
  return {
    ...state,
    hasUnsavedChanges: true,
  };
}
