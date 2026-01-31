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
import {reducer} from './profile_reducers';
import {ProfileState} from './profile_types';
import * as profileActions from '../actions/profile_actions';
import {DataLoadState} from '../../types/data';
import {createEmptyProfile} from '../types';

describe('profile reducers', () => {
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

  describe('profileListRequested', () => {
    it('sets profileListLoadState to LOADING', () => {
      const state = reducer(initialState, profileActions.profileListRequested());
      expect(state.profileListLoadState).toBe(DataLoadState.LOADING);
    });
  });

  describe('profileListLoaded', () => {
    it('sets availableProfiles and profileListLoadState to LOADED', () => {
      const profiles = [
        {name: 'Profile 1', lastModifiedTimestamp: 1000},
        {name: 'Profile 2', lastModifiedTimestamp: 2000},
      ];
      const state = reducer(
        initialState,
        profileActions.profileListLoaded({profiles})
      );
      expect(state.availableProfiles).toEqual(profiles);
      expect(state.profileListLoadState).toBe(DataLoadState.LOADED);
      expect(state.lastError).toBeNull();
    });
  });

  describe('profileLoadRequested', () => {
    it('sets profileLoadState to LOADING', () => {
      const state = reducer(
        initialState,
        profileActions.profileLoadRequested({name: 'Test'})
      );
      expect(state.profileLoadState).toBe(DataLoadState.LOADING);
    });
  });

  describe('profileLoaded', () => {
    it('sets activeProfile and activeProfileName', () => {
      const profile = createEmptyProfile('Test Profile');
      const state = reducer(
        initialState,
        profileActions.profileLoaded({profile})
      );
      expect(state.activeProfile).toEqual(profile);
      expect(state.activeProfileName).toBe('Test Profile');
      expect(state.hasUnsavedChanges).toBe(false);
      expect(state.profileLoadState).toBe(DataLoadState.LOADED);
    });
  });

  describe('profileLoadFailed', () => {
    it('sets profileLoadState to FAILED and lastError', () => {
      const state = reducer(
        initialState,
        profileActions.profileLoadFailed({name: 'Test', error: 'Not found'})
      );
      expect(state.profileLoadState).toBe(DataLoadState.FAILED);
      expect(state.lastError).toBe('Not found');
    });
  });

  describe('profileSaved', () => {
    it('updates availableProfiles and sets activeProfile', () => {
      const profile = createEmptyProfile('New Profile');
      const state = reducer(initialState, profileActions.profileSaved({profile}));

      expect(state.availableProfiles.length).toBe(1);
      expect(state.availableProfiles[0].name).toBe('New Profile');
      expect(state.activeProfile).toEqual(profile);
      expect(state.activeProfileName).toBe('New Profile');
      expect(state.hasUnsavedChanges).toBe(false);
    });

    it('updates existing profile in availableProfiles', () => {
      const existingState: ProfileState = {
        ...initialState,
        availableProfiles: [
          {name: 'Existing', lastModifiedTimestamp: 1000},
          {name: 'Other', lastModifiedTimestamp: 500},
        ],
      };

      const profile = createEmptyProfile('Existing');
      profile.lastModifiedTimestamp = 2000;

      const state = reducer(existingState, profileActions.profileSaved({profile}));

      expect(state.availableProfiles.length).toBe(2);
      // Should be sorted by timestamp (most recent first)
      expect(state.availableProfiles[0].name).toBe('Existing');
      expect(state.availableProfiles[0].lastModifiedTimestamp).toBe(2000);
    });
  });

  describe('profileDeleted', () => {
    it('removes profile from availableProfiles', () => {
      const existingState: ProfileState = {
        ...initialState,
        availableProfiles: [
          {name: 'Keep', lastModifiedTimestamp: 1000},
          {name: 'Delete', lastModifiedTimestamp: 2000},
        ],
      };

      const state = reducer(
        existingState,
        profileActions.profileDeleted({name: 'Delete'})
      );

      expect(state.availableProfiles.length).toBe(1);
      expect(state.availableProfiles[0].name).toBe('Keep');
    });

    it('clears activeProfile if deleted profile was active', () => {
      const profile = createEmptyProfile('Active');
      const existingState: ProfileState = {
        ...initialState,
        availableProfiles: [{name: 'Active', lastModifiedTimestamp: 1000}],
        activeProfile: profile,
        activeProfileName: 'Active',
      };

      const state = reducer(
        existingState,
        profileActions.profileDeleted({name: 'Active'})
      );

      expect(state.activeProfile).toBeNull();
      expect(state.activeProfileName).toBeNull();
    });
  });

  describe('profileExported', () => {
    it('sets lastExportedJson', () => {
      const json = '{"version":1,"data":{}}';
      const state = reducer(
        initialState,
        profileActions.profileExported({name: 'Test', json})
      );
      expect(state.lastExportedJson).toBe(json);
    });
  });

  describe('profileImported', () => {
    it('adds imported profile to availableProfiles', () => {
      const profile = createEmptyProfile('Imported');
      const state = reducer(
        initialState,
        profileActions.profileImported({profile})
      );

      expect(state.availableProfiles.length).toBe(1);
      expect(state.availableProfiles[0].name).toBe('Imported');
    });
  });

  describe('profileActivated', () => {
    it('sets activeProfile and activeProfileName', () => {
      const profile = createEmptyProfile('Activated');
      const state = reducer(
        initialState,
        profileActions.profileActivated({profile})
      );

      expect(state.activeProfile).toEqual(profile);
      expect(state.activeProfileName).toBe('Activated');
      expect(state.hasUnsavedChanges).toBe(false);
    });
  });

  describe('profileDeactivated', () => {
    it('clears activeProfile and activeProfileName', () => {
      const profile = createEmptyProfile('Active');
      const existingState: ProfileState = {
        ...initialState,
        activeProfile: profile,
        activeProfileName: 'Active',
        hasUnsavedChanges: true,
      };

      const state = reducer(existingState, profileActions.profileDeactivated());

      expect(state.activeProfile).toBeNull();
      expect(state.activeProfileName).toBeNull();
      expect(state.hasUnsavedChanges).toBe(false);
    });
  });

  describe('profilesClearedAll', () => {
    it('clears all profile state', () => {
      const profile = createEmptyProfile('Active');
      const existingState: ProfileState = {
        ...initialState,
        availableProfiles: [
          {name: 'Profile 1', lastModifiedTimestamp: 1000},
          {name: 'Profile 2', lastModifiedTimestamp: 2000},
        ],
        activeProfile: profile,
        activeProfileName: 'Active',
        hasUnsavedChanges: true,
        lastError: 'Some error',
      };

      const state = reducer(existingState, profileActions.profilesClearedAll());

      expect(state.availableProfiles).toEqual([]);
      expect(state.activeProfile).toBeNull();
      expect(state.activeProfileName).toBeNull();
      expect(state.hasUnsavedChanges).toBe(false);
      expect(state.lastError).toBeNull();
    });
  });

  describe('defaultProfileFetched', () => {
    it('stores default profile for experiment', () => {
      const profile = createEmptyProfile('Default');
      const state = reducer(
        initialState,
        profileActions.defaultProfileFetched({
          profile,
          experimentId: 'exp123',
        })
      );

      expect(state.defaultProfiles.get('exp123')).toEqual(profile);
    });

    it('does not modify state if profile is null', () => {
      const state = reducer(
        initialState,
        profileActions.defaultProfileFetched({
          profile: null,
          experimentId: 'exp123',
        })
      );

      expect(state.defaultProfiles.size).toBe(0);
    });
  });

  describe('profileRenamed', () => {
    it('updates profile name in availableProfiles', () => {
      const existingState: ProfileState = {
        ...initialState,
        availableProfiles: [
          {name: 'Old Name', lastModifiedTimestamp: 1000},
        ],
        activeProfileName: 'Old Name',
        activeProfile: createEmptyProfile('Old Name'),
      };

      const renamedProfile = createEmptyProfile('New Name');
      const state = reducer(
        existingState,
        profileActions.profileRenamed({
          oldName: 'Old Name',
          newName: 'New Name',
          profile: renamedProfile,
        })
      );

      expect(state.availableProfiles[0].name).toBe('New Name');
      expect(state.activeProfileName).toBe('New Name');
      expect(state.activeProfile!.name).toBe('New Name');
    });
  });
});
