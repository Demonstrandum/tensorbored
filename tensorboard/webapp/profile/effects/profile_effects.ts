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
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {of} from 'rxjs';
import {
  catchError,
  filter,
  map,
  mergeMap,
  switchMap,
  take,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import {navigated} from '../../app_routing/actions';
import {State} from '../../app_state';
import {
  getMetricsScalarSmoothing,
  getMetricsTagFilter,
  getPinnedCardsWithMetadata,
  getUnresolvedImportedPinnedCards,
  getSuperimposedCardsWithMetadata,
} from '../../metrics/store/metrics_selectors';
import {
  getRunColorOverride,
  getGroupKeyToColorIdMap,
  getRunUserSetGroupBy,
  getRunSelectorRegexFilter,
} from '../../runs/store/runs_selectors';
import {CardIdWithMetadata, CardUniqueInfo} from '../../metrics/types';
import {GroupByKey} from '../../runs/types';
import {ProfileDataSource} from '../data_source/profile_data_source';
import * as profileActions from '../actions/profile_actions';
import * as metricsActions from '../../metrics/actions';
import * as runsActions from '../../runs/actions';
import {
  ProfileData,
  ProfileGroupBy,
  RunColorEntry,
  GroupColorEntry,
  createEmptyProfile,
  PROFILE_VERSION,
} from '../types';
import {isSampledPlugin, isSingleRunPlugin} from '../../metrics/data_source/types';

/**
 * Effects for profile management.
 */
@Injectable()
export class ProfileEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly store: Store<State>,
    private readonly profileDataSource: ProfileDataSource
  ) {}

  /**
   * Load profile list on navigation.
   */
  loadProfileListOnNavigation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(navigated),
      take(1), // Only load once on initial navigation
      map(() => profileActions.profileListRequested())
    )
  );

  /**
   * Load the profile list from localStorage.
   */
  loadProfileList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(profileActions.profileListRequested),
      map(() => {
        const profiles = this.profileDataSource.listProfiles();
        return profileActions.profileListLoaded({profiles});
      })
    )
  );

  /**
   * Load a specific profile from localStorage.
   */
  loadProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(profileActions.profileLoadRequested),
      map(({name}) => {
        const profile = this.profileDataSource.loadProfile(name);
        if (profile) {
          return profileActions.profileLoaded({profile});
        }
        return profileActions.profileLoadFailed({
          name,
          error: `Profile "${name}" not found`,
        });
      })
    )
  );

  /**
   * Activate a loaded profile by applying its settings.
   */
  activateLoadedProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(profileActions.profileLoaded),
      map(({profile}) => profileActions.profileActivated({profile}))
    )
  );

  /**
   * Apply profile settings to metrics state.
   */
  applyProfileToMetrics$ = createEffect(() =>
    this.actions$.pipe(
      ofType(profileActions.profileActivated),
      map(({profile}) =>
        metricsActions.profileMetricsSettingsApplied({
          pinnedCards: profile.pinnedCards,
          superimposedCards: profile.superimposedCards.map((card) => ({
            id: card.id,
            title: card.title,
            tags: card.tags,
            runId: card.runId,
          })),
          tagFilter: profile.tagFilter,
          smoothing: profile.smoothing,
        })
      )
    )
  );

  /**
   * Apply profile settings to runs state.
   */
  applyProfileToRuns$ = createEffect(() =>
    this.actions$.pipe(
      ofType(profileActions.profileActivated),
      map(({profile}) => {
        let groupBy = null;
        if (profile.groupBy) {
          groupBy = {
            key: profile.groupBy.key,
            regexString: profile.groupBy.regexString,
          };
        }
        return runsActions.profileRunsSettingsApplied({
          runColors: profile.runColors,
          groupColors: profile.groupColors,
          groupBy,
          runFilter: profile.runFilter,
        });
      })
    )
  );

  /**
   * Save the current state as a profile.
   */
  saveProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(profileActions.profileSaveRequested),
      withLatestFrom(
        this.store.select(getPinnedCardsWithMetadata),
        this.store.select(getUnresolvedImportedPinnedCards),
        this.store.select(getSuperimposedCardsWithMetadata),
        this.store.select(getRunColorOverride),
        this.store.select(getGroupKeyToColorIdMap),
        this.store.select(getMetricsTagFilter),
        this.store.select(getRunSelectorRegexFilter),
        this.store.select(getMetricsScalarSmoothing),
        this.store.select(getRunUserSetGroupBy)
      ),
      map(
        ([
          {name},
          pinnedCards,
          unresolvedPinnedCards,
          superimposedCards,
          runColorOverrides,
          groupKeyToColorId,
          tagFilter,
          runFilter,
          smoothing,
          groupBy,
        ]) => {
          // Convert pinned cards to CardUniqueInfo format
          const pinnedCardsInfo: CardUniqueInfo[] = pinnedCards.map(
            (card: CardIdWithMetadata) => {
              const info: CardUniqueInfo = {
                plugin: card.plugin,
                tag: card.tag,
              };
              if (isSingleRunPlugin(card.plugin) && card.runId) {
                info.runId = card.runId;
              }
              if (isSampledPlugin(card.plugin) && card.sample !== undefined) {
                info.sample = card.sample;
              }
              return info;
            }
          );

          // Include unresolved imported pinned cards
          const allPinnedCards = [...pinnedCardsInfo, ...unresolvedPinnedCards];

          // Convert run colors Map to array
          const runColors: RunColorEntry[] = Array.from(
            runColorOverrides.entries()
          ).map(([runId, color]) => ({runId, color}));

          // Convert group colors Map to array
          const groupColors: GroupColorEntry[] = Array.from(
            groupKeyToColorId.entries()
          ).map(([groupKey, colorId]) => ({groupKey, colorId}));

          // Convert groupBy to ProfileGroupBy
          let profileGroupBy: ProfileGroupBy | null = null;
          if (groupBy) {
            profileGroupBy = {key: groupBy.key};
            if (
              groupBy.key === GroupByKey.REGEX ||
              groupBy.key === GroupByKey.REGEX_BY_EXP
            ) {
              profileGroupBy.regexString = groupBy.regexString;
            }
          }

          const profile: ProfileData = {
            version: PROFILE_VERSION,
            name,
            lastModifiedTimestamp: Date.now(),
            pinnedCards: allPinnedCards,
            runColors,
            groupColors,
            superimposedCards: [...superimposedCards],
            tagFilter,
            runFilter,
            smoothing,
            groupBy: profileGroupBy,
          };

          // Save to localStorage
          this.profileDataSource.saveProfile(profile);
          this.profileDataSource.setActiveProfileName(name);

          return profileActions.profileSaved({profile});
        }
      )
    )
  );

  /**
   * Delete a profile from localStorage.
   */
  deleteProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(profileActions.profileDeleteRequested),
      map(({name}) => {
        this.profileDataSource.deleteProfile(name);
        return profileActions.profileDeleted({name});
      })
    )
  );

  /**
   * Export a profile to JSON.
   */
  exportProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(profileActions.profileExportRequested),
      map(({name}) => {
        const profile = this.profileDataSource.loadProfile(name);
        if (!profile) {
          return profileActions.profileLoadFailed({
            name,
            error: `Profile "${name}" not found`,
          });
        }
        const json = this.profileDataSource.exportProfile(profile);
        return profileActions.profileExported({name, json});
      })
    )
  );

  /**
   * Import a profile from JSON.
   */
  importProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(profileActions.profileImportRequested),
      map(({json, newName}) => {
        const profile = this.profileDataSource.importProfile(json);
        if (!profile) {
          return profileActions.profileImportFailed({
            error: 'Invalid profile format',
          });
        }

        // Use provided name or generate a unique one
        const finalName =
          newName || this.profileDataSource.generateUniqueName(profile.name);
        const profileToSave: ProfileData = {
          ...profile,
          name: finalName,
          lastModifiedTimestamp: Date.now(),
        };

        this.profileDataSource.saveProfile(profileToSave);

        return profileActions.profileImported({profile: profileToSave});
      })
    )
  );

  /**
   * Clear all profiles from localStorage.
   */
  clearAllProfiles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(profileActions.profilesClearAllRequested),
      map(() => {
        this.profileDataSource.clearAllProfiles();
        return profileActions.profilesClearedAll();
      })
    )
  );

  /**
   * Fetch default profile from backend.
   */
  fetchDefaultProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(profileActions.defaultProfileFetchRequested),
      switchMap(({experimentId}) =>
        this.profileDataSource.fetchDefaultProfile(experimentId).pipe(
          map((profile) =>
            profileActions.defaultProfileFetched({profile, experimentId})
          ),
          catchError(() =>
            of(
              profileActions.defaultProfileFetched({
                profile: null,
                experimentId,
              })
            )
          )
        )
      )
    )
  );

  /**
   * Rename a profile.
   */
  renameProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(profileActions.profileRenameRequested),
      map(({oldName, newName}) => {
        const profile = this.profileDataSource.loadProfile(oldName);
        if (!profile) {
          return profileActions.profileLoadFailed({
            name: oldName,
            error: `Profile "${oldName}" not found`,
          });
        }

        // Delete old profile
        this.profileDataSource.deleteProfile(oldName);

        // Save with new name
        const renamedProfile: ProfileData = {
          ...profile,
          name: newName,
          lastModifiedTimestamp: Date.now(),
        };
        this.profileDataSource.saveProfile(renamedProfile);

        // Update active profile name if it was the renamed profile
        if (this.profileDataSource.getActiveProfileName() === oldName) {
          this.profileDataSource.setActiveProfileName(newName);
        }

        return profileActions.profileRenamed({
          oldName,
          newName,
          profile: renamedProfile,
        });
      })
    )
  );

  /**
   * Load active profile on startup.
   */
  loadActiveProfileOnStartup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(profileActions.profileListLoaded),
      map(() => {
        const activeProfileName =
          this.profileDataSource.getActiveProfileName();
        if (activeProfileName) {
          return profileActions.profileLoadRequested({
            name: activeProfileName,
          });
        }
        // Return a no-op action if no active profile
        return {type: '[Profile] No Active Profile'};
      }),
      filter((action) => action.type !== '[Profile] No Active Profile')
    )
  );

  /**
   * Download the exported profile JSON as a file.
   */
  downloadExportedProfile$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(profileActions.profileExported),
        tap(({name, json}) => {
          const blob = new Blob([json], {type: 'application/json'});
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${name.replace(/[^a-z0-9]/gi, '_')}_profile.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        })
      ),
    {dispatch: false}
  );
}
