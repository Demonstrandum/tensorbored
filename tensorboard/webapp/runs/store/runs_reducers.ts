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
import {
  Action,
  ActionReducer,
  combineReducers,
  createReducer,
  on,
} from '@ngrx/store';
import {areSameRouteKindAndExperiments} from '../../app_routing';
import {stateRehydratedFromUrl} from '../../app_routing/actions';
import {createNamespaceContextedState} from '../../app_routing/namespaced_state_reducer_helper';
import {RouteKind} from '../../app_routing/types';
import {DataLoadState} from '../../types/data';
import {composeReducers} from '../../util/ngrx';
import {DEFAULT_PALETTE} from '../../util/colors';
import * as runsActions from '../actions';
import {GroupBy, GroupByKey, URLDeserializedState} from '../types';
import {
  MAX_NUM_RUNS_TO_ENABLE_BY_DEFAULT,
  RunsDataNamespacedState,
  RunsDataNonNamespacedState,
  RunsDataState,
  RunsState,
  RunsUiNamespacedState,
  RunsUiNonNamespacedState,
  RunsUiState,
} from './runs_types';
import {createGroupBy, groupRuns} from './utils';
import {ColumnHeaderType, SortingOrder} from '../../widgets/data_table/types';

type Rgb = {r: number; g: number; b: number};

const DEFAULT_RUN_COLORS = DEFAULT_PALETTE.colors.map(
  (color) => color.lightHex
);
const DEFAULT_RUN_COLORS_RGB: Rgb[] = DEFAULT_RUN_COLORS.map((hex) => {
  const normalized = hex.startsWith('#') ? hex.slice(1) : hex;
  // Expected format: RRGGBB.
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return {r, g, b};
});

function rgbDistSq(a: Rgb, b: Rgb): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return dr * dr + dg * dg + db * db;
}

function fnv1a32(input: string): number {
  // 32-bit FNV-1a.
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function getGroupByScopeKey(groupBy: GroupBy): string {
  switch (groupBy.key) {
    case GroupByKey.RUN:
      return 'run';
    case GroupByKey.EXPERIMENT:
      return 'experiment';
    case GroupByKey.REGEX:
      return `regex:${groupBy.regexString}`;
    case GroupByKey.REGEX_BY_EXP:
      return `regex_by_exp:${groupBy.regexString}`;
  }
}

function makeScopedGroupKey(scopeKey: string, groupId: string): string {
  return `${scopeKey}|${groupId}`;
}

function pickColorIdForGroupKey(groupKey: string, used: Set<number>): number {
  const paletteLen = DEFAULT_RUN_COLORS_RGB.length;
  const preferred = fnv1a32(groupKey) % paletteLen;
  if (!used.has(preferred)) return preferred;
  if (used.size >= paletteLen) return preferred;

  // Choose the unused color that maximizes minimum distance to all used colors.
  let bestIdx = -1;
  let bestMinDist = -1;
  let bestTie = 0;
  for (let idx = 0; idx < paletteLen; idx++) {
    if (used.has(idx)) continue;
    let minDist = Infinity;
    for (const usedIdx of used) {
      const dist = rgbDistSq(
        DEFAULT_RUN_COLORS_RGB[idx],
        DEFAULT_RUN_COLORS_RGB[usedIdx]
      );
      if (dist < minDist) minDist = dist;
    }
    const tie = fnv1a32(`${groupKey}:${idx}`);
    if (minDist > bestMinDist || (minDist === bestMinDist && tie > bestTie)) {
      bestIdx = idx;
      bestMinDist = minDist;
      bestTie = tie;
    }
  }
  return bestIdx >= 0 ? bestIdx : preferred;
}

const {
  initialState: dataInitialState,
  reducers: dataNamespaceContextedReducers,
} = createNamespaceContextedState<
  RunsDataNamespacedState,
  RunsDataNonNamespacedState
>(
  {
    runColorOverrideForGroupBy: new Map(),
    defaultRunColorIdForGroupBy: new Map(),
    groupKeyToColorId: new Map(),
    initialGroupBy: {key: GroupByKey.RUN},
    userSetGroupByKey: null,
    colorGroupRegexString: '',
    regexFilter: '',
  },
  {
    runIds: {},
    runIdToExpId: {},
    runMetadata: {},
    runsLoadState: {},
  },
  /* onNavigated() */
  (state, oldRoute, newRoute) => {
    if (!areSameRouteKindAndExperiments(oldRoute, newRoute)) {
      return {
        ...state,
        initialGroupBy: {
          key:
            newRoute.routeKind === RouteKind.COMPARE_EXPERIMENT
              ? GroupByKey.EXPERIMENT
              : GroupByKey.RUN,
        },
      };
    }
    return state;
  }
);

const dataReducer: ActionReducer<RunsDataState, Action> = createReducer(
  dataInitialState,
  // Color grouping potentially is an expensive operation and assigning colors
  // on route changes may not actually be effective at all. Because we are
  // using NamespaceContextedState, color assignment and groupBy information
  // should not go out of sync. That is, for a given route, the condition in
  // which the colors get assigned are (1) when user changes groupBy and (2)
  // when new runs are fetched (new runs added or runs removed). Both of those
  // cases are handled by their respective reducer functions and, while there is
  // no strong guarantees at the moment, because we are using
  // NamespaceContextedState, even if new runs are fetched for a route that is
  // not active, refresh of a background experiment data will not result in
  // correct state update.
  //
  // While user can change groupBy state in the URL to trigger (1), that will
  // result in browser postback and the app will rebootstrap anyways.
  //
  // Given above, and given that user can go back and forth in history to cause
  // `stateRehydratedFromUrl` often, it would be computationally wasteful to
  // reassign the color as it will exactly be the same.
  on(stateRehydratedFromUrl, (state, {routeKind, partialState}) => {
    if (
      routeKind !== RouteKind.COMPARE_EXPERIMENT &&
      routeKind !== RouteKind.EXPERIMENT
    ) {
      return state;
    }

    const dehydratedState = partialState as URLDeserializedState;
    const groupBy = dehydratedState.runs.groupBy;
    const regexFilter = dehydratedState.runs.regexFilter ?? '';

    if (!groupBy && !regexFilter) {
      return state;
    }

    let {colorGroupRegexString, userSetGroupByKey} = state;
    if (groupBy) {
      const regexString =
        groupBy.key === GroupByKey.REGEX ||
        groupBy.key === GroupByKey.REGEX_BY_EXP
          ? groupBy.regexString
          : state.colorGroupRegexString;
      colorGroupRegexString = regexString;
      userSetGroupByKey = groupBy.key ?? null;
    }

    return {
      ...state,
      colorGroupRegexString,
      regexFilter,
      userSetGroupByKey,
    };
  }),
  on(runsActions.fetchRunsRequested, (state, action) => {
    const nextRunsLoadState = {...state.runsLoadState};
    for (const eid of action.requestedExperimentIds) {
      if (!nextRunsLoadState[eid]) {
        nextRunsLoadState[eid] = {
          lastLoadedTimeInMs: null,
          state: DataLoadState.LOADING,
        };
      } else {
        nextRunsLoadState[eid] = {
          ...nextRunsLoadState[eid],
          state: DataLoadState.LOADING,
        };
      }
    }

    return {...state, runsLoadState: nextRunsLoadState};
  }),
  on(runsActions.fetchRunsSucceeded, (state, action) => {
    const nextRunIds = {...state.runIds};
    const nextRunMetadata = {...state.runMetadata};
    const nextRunIdToExpId = {...state.runIdToExpId};
    const nextRunsLoadState = {...state.runsLoadState};

    for (const eid of Object.keys(action.newRuns)) {
      const {runs} = action.newRuns[eid];
      nextRunIds[eid] = runs.map(({id}) => id);
      nextRunsLoadState[eid] = {
        ...nextRunsLoadState[eid],
        lastLoadedTimeInMs: Date.now(),
        state: DataLoadState.LOADED,
      };

      for (const run of runs) {
        nextRunMetadata[run.id] = {
          ...run,
          // fetchRunsSucceeded once contained hparam and metric information.
          // No longer. These are always null in state and augmented downstream
          // by the hparams feature.
          hparams: null,
          metrics: null,
        };
        nextRunIdToExpId[run.id] = eid;
      }
    }

    return {
      ...state,
      runIds: nextRunIds,
      runIdToExpId: nextRunIdToExpId,
      runMetadata: nextRunMetadata,
      runsLoadState: nextRunsLoadState,
    };
  }),
  on(runsActions.fetchRunsFailed, (state, action) => {
    const nextRunsLoadState = {...state.runsLoadState};
    for (const eid of action.requestedExperimentIds) {
      if (!nextRunsLoadState[eid]) {
        nextRunsLoadState[eid] = {
          lastLoadedTimeInMs: null,
          state: DataLoadState.FAILED,
        };
      } else {
        nextRunsLoadState[eid] = {
          ...nextRunsLoadState[eid],
          state: DataLoadState.FAILED,
        };
      }
    }
    return {...state, runsLoadState: nextRunsLoadState};
  }),
  on(
    runsActions.fetchRunsSucceeded,
    (state, {runsForAllExperiments, expNameByExpId}) => {
      const groupKeyToColorId = new Map(state.groupKeyToColorId);
      const defaultRunColorIdForGroupBy = new Map(
        state.defaultRunColorIdForGroupBy
      );

      let groupBy = state.initialGroupBy;
      if (state.userSetGroupByKey !== null) {
        groupBy = createGroupBy(
          state.userSetGroupByKey,
          state.colorGroupRegexString
        );
      }
      const groups = groupRuns(
        groupBy,
        runsForAllExperiments,
        state.runIdToExpId,
        expNameByExpId
      );

      const scopeKey = getGroupByScopeKey(groupBy);
      const scopePrefix = `${scopeKey}|`;
      const usedColorIds = new Set<number>();
      for (const [key, colorId] of groupKeyToColorId.entries()) {
        if (key.startsWith(scopePrefix)) {
          usedColorIds.add(colorId);
        }
      }

      const groupIds = Object.keys(groups.matches).sort();
      for (const groupId of groupIds) {
        const scopedGroupKey = makeScopedGroupKey(scopeKey, groupId);
        let colorId = groupKeyToColorId.get(scopedGroupKey);
        if (colorId === undefined) {
          colorId = pickColorIdForGroupKey(scopedGroupKey, usedColorIds);
          groupKeyToColorId.set(scopedGroupKey, colorId);
        }
        usedColorIds.add(colorId);

        for (const run of groups.matches[groupId]) {
          defaultRunColorIdForGroupBy.set(run.id, colorId);
        }
      }

      // unassign color for nonmatched runs to apply default unassigned style
      for (const run of groups.nonMatches) {
        defaultRunColorIdForGroupBy.set(run.id, -1);
      }

      return {
        ...state,
        defaultRunColorIdForGroupBy,
        groupKeyToColorId,
      };
    }
  ),
  on(
    runsActions.runGroupByChanged,
    (
      state: RunsDataState,
      {experimentIds, groupBy, expNameByExpId}
    ): RunsDataState => {
      const groupKeyToColorId = new Map(state.groupKeyToColorId);
      const defaultRunColorIdForGroupBy = new Map(
        state.defaultRunColorIdForGroupBy
      );

      const allRuns = experimentIds
        .flatMap((experimentId) => state.runIds[experimentId])
        .map((runId) => state.runMetadata[runId]);

      const groups = groupRuns(
        groupBy,
        allRuns,
        state.runIdToExpId,
        expNameByExpId
      );

      const scopeKey = getGroupByScopeKey(groupBy);
      const scopePrefix = `${scopeKey}|`;
      const usedColorIds = new Set<number>();
      for (const [key, colorId] of groupKeyToColorId.entries()) {
        if (key.startsWith(scopePrefix)) {
          usedColorIds.add(colorId);
        }
      }

      const groupIds = Object.keys(groups.matches).sort();
      for (const groupId of groupIds) {
        const scopedGroupKey = makeScopedGroupKey(scopeKey, groupId);
        let colorId = groupKeyToColorId.get(scopedGroupKey);
        if (colorId === undefined) {
          colorId = pickColorIdForGroupKey(scopedGroupKey, usedColorIds);
          groupKeyToColorId.set(scopedGroupKey, colorId);
        }
        usedColorIds.add(colorId);

        for (const run of groups.matches[groupId]) {
          defaultRunColorIdForGroupBy.set(run.id, colorId);
        }
      }

      // unassign color for nonmatched runs to apply default unassigned style
      for (const run of groups.nonMatches) {
        defaultRunColorIdForGroupBy.set(run.id, -1);
      }

      const updatedRegexString =
        groupBy.key === GroupByKey.REGEX ||
        groupBy.key === GroupByKey.REGEX_BY_EXP
          ? groupBy.regexString
          : state.colorGroupRegexString;

      return {
        ...state,
        colorGroupRegexString: updatedRegexString,
        userSetGroupByKey: groupBy.key,
        defaultRunColorIdForGroupBy,
        groupKeyToColorId,
      };
    }
  ),
  on(runsActions.runColorChanged, (state, {runId, newColor}) => {
    const nextRunColorOverride = new Map(state.runColorOverrideForGroupBy);
    nextRunColorOverride.set(runId, newColor);

    return {...state, runColorOverrideForGroupBy: nextRunColorOverride};
  }),
  on(
    runsActions.runColorSettingsLoaded,
    (state, {runColorOverrides, groupKeyToColorId}) => {
      const nextRunColorOverride = new Map(state.runColorOverrideForGroupBy);
      for (const [runId, color] of runColorOverrides) {
        nextRunColorOverride.set(runId, color);
      }

      const nextGroupKeyToColorId = new Map(state.groupKeyToColorId);
      for (const [groupKey, colorId] of groupKeyToColorId) {
        nextGroupKeyToColorId.set(groupKey, colorId);
      }

      return {
        ...state,
        runColorOverrideForGroupBy: nextRunColorOverride,
        groupKeyToColorId: nextGroupKeyToColorId,
      };
    }
  ),
  on(
    runsActions.runColorOverridesFetchedFromApi,
    (state, {runColorOverrides}) => {
      const nextRunColorOverride = new Map(state.runColorOverrideForGroupBy);
      for (const [runId, color] of runColorOverrides) {
        if (!nextRunColorOverride.has(runId)) {
          nextRunColorOverride.set(runId, color);
        }
      }
      return {...state, runColorOverrideForGroupBy: nextRunColorOverride};
    }
  ),
  on(runsActions.runSelectorRegexFilterChanged, (state, action) => {
    return {
      ...state,
      regexFilter: action.regexString,
    };
  })
);

const dataReducers = composeReducers(
  dataReducer,
  dataNamespaceContextedReducers
);

const {initialState: uiInitialState, reducers: uiNamespaceContextedReducers} =
  createNamespaceContextedState<
    RunsUiNamespacedState,
    RunsUiNonNamespacedState
  >(
    {
      selectionState: new Map<string, boolean>(),
      runsTableHeaders: [
        {
          type: ColumnHeaderType.RUN,
          name: 'run',
          displayName: 'Run',
          enabled: true,
          sortable: true,
          removable: false,
          movable: false,
          filterable: false,
        },
      ],
      sortingInfo: {
        name: 'run',
        order: SortingOrder.ASCENDING,
      },
    },
    {},
    /* onNavigated() */
    (state, oldRoute, newRoute) => {
      if (!areSameRouteKindAndExperiments(oldRoute, newRoute)) {
        if (
          newRoute.routeKind === RouteKind.COMPARE_EXPERIMENT &&
          !state.runsTableHeaders.find(
            (header) => header.name === 'experimentAlias'
          )
        ) {
          const newRunsTableHeaders = [
            ...state.runsTableHeaders,
            {
              type: ColumnHeaderType.CUSTOM,
              name: 'experimentAlias',
              displayName: 'Experiment',
              enabled: true,
              movable: false,
              sortable: true,
            },
          ];

          return {
            ...state,
            runsTableHeaders: newRunsTableHeaders,
          };
        }
        if (
          oldRoute?.routeKind === RouteKind.COMPARE_EXPERIMENT &&
          newRoute.routeKind !== RouteKind.COMPARE_EXPERIMENT
        ) {
          const newRunsTableHeaders = state.runsTableHeaders.filter(
            (column) => column.name !== 'experimentAlias'
          );

          return {
            ...state,
            runsTableHeaders: newRunsTableHeaders,
          };
        }
      }
      return state;
    }
  );

const uiReducer: ActionReducer<RunsUiState, Action> = createReducer(
  uiInitialState,
  on(runsActions.fetchRunsSucceeded, (state, action) => {
    const nextSelectionState = new Map(state.selectionState);

    // Populate selection states for previously unseen runs.
    const runSelected =
      action.runsForAllExperiments.length <= MAX_NUM_RUNS_TO_ENABLE_BY_DEFAULT;
    for (const run of action.runsForAllExperiments) {
      if (!nextSelectionState.has(run.id)) {
        nextSelectionState.set(run.id, runSelected);
      }
    }

    return {
      ...state,
      selectionState: nextSelectionState,
    };
  }),
  on(runsActions.runSelectionToggled, (state, {runId}) => {
    const nextSelectionState = new Map(state.selectionState);
    nextSelectionState.set(runId, !Boolean(nextSelectionState.get(runId)));

    return {
      ...state,
      selectionState: nextSelectionState,
    };
  }),
  on(runsActions.singleRunSelected, (state, {runId}) => {
    const nextSelectionState = new Map<string, boolean>();

    // Select the specified run and deselect the others.
    for (const stateRunId of state.selectionState.keys()) {
      nextSelectionState.set(stateRunId, runId === stateRunId);
    }

    return {
      ...state,
      selectionState: nextSelectionState,
    };
  }),
  on(runsActions.runPageSelectionToggled, (state, {runIds}) => {
    const nextSelectionState = new Map(state.selectionState);

    const nextValue = !runIds.every((runId) => {
      return Boolean(nextSelectionState.get(runId));
    });
    for (const runId of runIds) {
      nextSelectionState.set(runId, nextValue);
    }

    return {
      ...state,
      selectionState: nextSelectionState,
    };
  }),
  on(runsActions.runsTableHeaderAdded, (state, {header, index}) => {
    const newRunsTableHeaders = [...state.runsTableHeaders];
    if (index === undefined) {
      newRunsTableHeaders.push(header);
    } else {
      newRunsTableHeaders.splice(index, 0, header);
    }

    return {
      ...state,
      runsTableHeaders: newRunsTableHeaders,
    };
  }),
  on(runsActions.runsTableHeaderRemoved, (state, {header}) => {
    const newRunsTableHeaders = state.runsTableHeaders.filter(
      ({name}) => name !== header.name
    );

    return {
      ...state,
      runsTableHeaders: newRunsTableHeaders,
    };
  }),
  on(runsActions.runsTableHeaderOrderChanged, (state, {newHeaderOrder}) => {
    return {
      ...state,
      runsTableHeaders: newHeaderOrder,
    };
  }),
  on(runsActions.runsTableSortingInfoChanged, (state, {sortingInfo}) => {
    return {
      ...state,
      sortingInfo,
    };
  })
);

const uiReducers = composeReducers(uiReducer, uiNamespaceContextedReducers);

/**
 * Reducers for the experiments.
 */
export function reducers(state: RunsState | undefined, action: Action) {
  return combineReducers({
    data: dataReducers,
    ui: uiReducers,
  })(state, action);
}
