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
 * @fileoverview Module that provides convenience selector for UI.
 *
 * NOTE: For accessing a specific feature, please define and use the selectors
 * provided by the feature.
 *
 * This module provides selectors that access states across multiple features
 * for convenience of the UI[1].
 *
 * [1]: In most cases, one should be able to use combination of rxjs primitives
 * like `mergeMap` and `withLatestFrom` to achieve the same thing.
 */

import {createSelector} from '@ngrx/store';
import {
  getExperimentIdsFromRoute,
  getExperimentIdToExperimentAliasMap,
  getRouteKind,
} from '../app_routing/store/app_routing_selectors';
import {RouteKind} from '../app_routing/types';
import {State} from '../app_state';
import {getDarkModeEnabled} from '../feature_flag/store/feature_flag_selectors';
import {
  getDefaultRunColorIdMap,
  getRunColorOverride,
  getRunIdToExperimentId,
  getRuns,
  getDashboardRuns,
  getRunSelectionMap,
  getRunSelectorRegexFilter,
} from '../runs/store/runs_selectors';
import {ExperimentId, RunId} from '../runs/store/runs_types';
import {selectors} from '../settings';
import {ColorPalette} from './colors';
import {matchRunToRegex, RunMatchable} from './matcher';
import {hashColorIdToHex} from './oklch_colors';

/**
 * Creates a copy of RunSelectionMap with entries filtered to runs that
 * belong to one of the current experiments in the route.
 */
const getRunSelectionMapFilteredToCurrentRoute = createSelector<
  State,
  string[] | null,
  Map<string, boolean>,
  Record<RunId, ExperimentId>,
  Map<string, boolean>
>(
  getExperimentIdsFromRoute,
  getRunSelectionMap,
  getRunIdToExperimentId,
  (experimentIds, runSelectionMap, runIds) => {
    if (!experimentIds) {
      // No experiments in the route means there are no runs to select.
      return new Map<string, boolean>();
    }

    const filteredRunSelectionMap = new Map<string, boolean>();
    for (const [runId, value] of runSelectionMap.entries()) {
      const experimentId = runIds[runId];
      if (experimentId && experimentIds.indexOf(experimentId) >= 0) {
        // Run belongs to one of the Route's experiments. Add it to the filtered
        // result.
        filteredRunSelectionMap.set(runId, value);
      }
    }
    return filteredRunSelectionMap;
  }
);

const getRunMatchableMap = createSelector(
  getExperimentIdToExperimentAliasMap,
  getDashboardRuns,
  (aliasMap, runs) => {
    const runMatchableMap = new Map<string, RunMatchable>();
    for (const run of runs) {
      runMatchableMap.set(run.id, {
        runName: run.name,
        experimentAlias: aliasMap[run.experimentId],
      });
    }
    return runMatchableMap;
  }
);

/**
 * Selects the run selection (runId to boolean) of current set of experiments.
 *
 * Note that emits null when current route is not about an experiment.
 */
export const getCurrentRouteRunSelection = createSelector(
  getExperimentIdsFromRoute,
  getRunSelectionMapFilteredToCurrentRoute,
  getRunSelectorRegexFilter,
  getRunMatchableMap,
  getRouteKind,
  (experimentIds, runSelection, regexFilter, runMatchableMap, routeKind) => {
    if (!experimentIds) {
      // There are no experiments in the route. Return null.
      return null;
    }
    const includeExperimentInfo = routeKind === RouteKind.COMPARE_EXPERIMENT;
    const filteredSelection = new Map<string, boolean>();

    for (const [runId, value] of runSelection.entries()) {
      const runMatchable = runMatchableMap.get(runId)!;
      filteredSelection.set(
        runId,
        matchRunToRegex(runMatchable, regexFilter, includeExperimentInfo) &&
          value
      );
    }
    return filteredSelection;
  }
);

/**
 * Threshold below which a colorId is in the legacy 7-color palette range.
 * All new hash-based colorIds are full 32-bit hashes (> 6).
 */
const LEGACY_PALETTE_MAX_ID = 6;

/**
 * Returns Observable that emits map of run id to run color (hex).
 *
 * Color priority:
 *   1. Explicit override (user-set, profile, or clash-resolved)
 *   2. Hash-based OKLCH color derived from the 32-bit colorId
 *   3. Legacy palette lookup (for old-format colorIds 0-6)
 *   4. Inactive color (for non-matching / colorId === -1)
 */
export const getRunColorMap = createSelector<
  State,
  ColorPalette,
  Map<string, number>,
  Map<string, string>,
  boolean,
  {[runId: string]: string}
>(
  selectors.getColorPalette,
  getDefaultRunColorIdMap,
  getRunColorOverride,
  getDarkModeEnabled,
  (
    colorPalette,
    defaultRunColorId,
    colorOverride,
    useDarkMode
  ): Record<string, string> => {
    const colorObject: Record<string, string> = {};

    defaultRunColorId.forEach((colorId, runId) => {
      if (colorOverride.has(runId)) {
        colorObject[runId] = colorOverride.get(runId)!;
      } else if (colorId > LEGACY_PALETTE_MAX_ID) {
        // New hash-based OKLCH color (colorId is a full 32-bit FNV hash).
        colorObject[runId] = hashColorIdToHex(colorId, useDarkMode);
      } else if (colorId >= 0) {
        // Legacy palette lookup for old-format colorIds (0-6).
        const color = colorPalette.colors[colorId % colorPalette.colors.length];
        colorObject[runId] = useDarkMode ? color.darkHex : color.lightHex;
      } else {
        // Non-matching / inactive run.
        colorObject[runId] = useDarkMode
          ? colorPalette.inactive.darkHex
          : colorPalette.inactive.lightHex;
      }
    });

    // Include color overrides for runs not yet in the default map.
    colorOverride.forEach((color, runId) => {
      if (!colorObject.hasOwnProperty(runId)) {
        colorObject[runId] = color;
      }
    });

    return colorObject;
  }
);
