/* Copyright 2020 The TensorFlow Authors. All Rights Reserved.

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
/**
 * @fileoverview Experiments Ngrx actions.
 */

import {createAction, props} from '@ngrx/store';
import {Run} from '../data_source/runs_data_source_types';
import {ExperimentIdToRuns, GroupBy} from '../types';
import {ColumnHeader, SortingInfo} from '../../widgets/data_table/types';

/**
 * The action can fire when no requests are actually made (i.e., an empty
 * requestedExperimentIds).
 */
export const fetchRunsRequested = createAction(
  '[Runs] Fetch Runs Requested',
  props<{experimentIds: string[]; requestedExperimentIds: string[]}>()
);

/**
 * The action can fire when no requests are actually made (i.e., an empty
 * requestedExperimentIds).
 */
export const fetchRunsSucceeded = createAction(
  '[Runs] Fetch Runs Succeeded',
  props<{
    experimentIds: string[];
    runsForAllExperiments: Run[];
    newRuns: ExperimentIdToRuns;
    expNameByExpId?: Record<string, string>;
  }>()
);

export const fetchRunsFailed = createAction(
  '[Runs] Fetch Runs Failed',
  props<{experimentIds: string[]; requestedExperimentIds: string[]}>()
);

export const runSelectionToggled = createAction(
  '[Runs] Run Selection Toggled',
  props<{runId: string}>()
);

/**
 * An action to indicate a single run being selected while all other runs are to
 * be deselected.
 */
export const singleRunSelected = createAction(
  '[Runs] Single Run Selected',
  props<{runId: string}>()
);

export const runRangeSelectionToggled = createAction(
  '[Runs] Run Range Selection Toggled',
  props<{runIds: string[]; selected: boolean}>()
);

export const runPageSelectionToggled = createAction(
  '[Runs] Run Page Selection Toggled',
  props<{runIds: string[]}>()
);

export const runSelectionStateLoaded = createAction(
  '[Runs] Run Selection State Loaded',
  props<{
    /**
     * Serialized entries for Map<RunId, boolean>.
     */
    runSelection: Array<[runId: string, selected: boolean]>;
  }>()
);

export const runSelectorRegexFilterChanged = createAction(
  '[Runs] Run Selector Regex Filter Changed',
  props<{regexString: string}>()
);

export const runColorChanged = createAction(
  '[Runs] Run Color Changed',
  props<{runId: string; newColor: string}>()
);

export const runColorSettingsLoaded = createAction(
  '[Runs] Run Color Settings Loaded',
  props<{
    /**
     * Serialized entries for `Map<RunId, hexColor>`.
     */
    runColorOverrides: Array<[runId: string, color: string]>;
    /**
     * Serialized entries for `Map<groupKey, colorId>`.
     */
    groupKeyToColorId: Array<[groupKey: string, colorId: number]>;
  }>()
);

export const runColorOverridesFetchedFromApi = createAction(
  '[Runs] Run Color Overrides Fetched From Api',
  props<{
    /**
     * Serialized entries for `Map<RunId, hexColor>`.
     *
     * These come from the backend (or a file the backend reads), and should not
     * override user-chosen colors.
     */
    runColorOverrides: Array<[runId: string, color: string]>;
  }>()
);

export const runGroupByChanged = createAction(
  '[Runs] Run Group By Changed',
  props<{
    experimentIds: string[];
    groupBy: GroupBy;
    expNameByExpId?: Record<string, string>;
  }>()
);

/**
 * Inserts the provided column header at the specified index.
 */
export const runsTableHeaderAdded = createAction(
  '[Runs] Runs Table Header Added',
  props<{header: ColumnHeader; index?: number}>()
);

/**
 * Removes the provided header
 */
export const runsTableHeaderRemoved = createAction(
  '[Runs] Runs Table Header Removed',
  props<{header: ColumnHeader}>()
);

/**
 * Users requested to change the order of the columns in the runs table.
 */
export const runsTableHeaderOrderChanged = createAction(
  '[Runs] Runs Table Header Order Changed',
  props<{newHeaderOrder: ColumnHeader[]}>()
);

/**
 * Updates the sorting logic used by the runs data tabe.
 */
export const runsTableSortingInfoChanged = createAction(
  '[Runs] Runs Table Sorting Info Changed',
  props<{sortingInfo: SortingInfo}>()
);

/**
 * Action to apply profile settings to runs state.
 * Dispatched when a profile is activated.
 */
export const profileRunsSettingsApplied = createAction(
  '[Runs] Profile Settings Applied',
  props<{
    runColors: Array<{runId: string; color: string}>;
    groupColors: Array<{groupKey: string; colorId: number}>;
    groupBy: GroupBy | null;
    runFilter: string;
  }>()
);
