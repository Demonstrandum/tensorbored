/* Copyright 2024 The TensorFlow Authors. All Rights Reserved.

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
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {Store} from '@ngrx/store';
import {combineLatest, from, Observable, of, Subject} from 'rxjs';
import {
  combineLatestWith,
  debounceTime,
  map,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
} from 'rxjs/operators';
import {State} from '../../../app_state';
import {ExperimentAlias} from '../../../experiments/types';
import {getForceSvgFeatureFlag} from '../../../feature_flag/store/feature_flag_selectors';
import {
  getDarkModeEnabled,
  getExperimentIdForRunId,
  getExperimentIdToExperimentAliasMap,
  getRun,
  getRunColorMap,
  getCurrentRouteRunSelection,
} from '../../../selectors';
import {DataLoadState} from '../../../types/data';
import {RunColorScale} from '../../../types/ui';
import {classicSmoothing} from '../../../widgets/line_chart_v2/data_transformer';
import {ScaleType} from '../../../widgets/line_chart_v2/types';
import {Extent} from '../../../widgets/line_chart_v2/lib/public_types';
import * as actions from '../../actions';
import {PluginType, ScalarStepDatum} from '../../data_source';
import {
  getMetricsIgnoreOutliers,
  getMetricsScalarSmoothing,
  getMetricsTooltipSort,
  getMetricsXAxisType,
  getCardStateMap,
} from '../../store';
import {
  getMetricsScalarPartitionNonMonotonicX,
  getTimeSeriesForTags,
  getLoadStateForTags,
} from '../../store/metrics_selectors';
import {CardId, XAxisType} from '../../types';
import {
  PartialSeries,
  PartitionedSeries,
  ScalarCardDataSeries,
  ScalarCardPoint,
  ScalarCardSeriesMetadataMap,
  SeriesType,
} from './scalar_card_types';
import {partitionSeries} from './utils';
import {getFilteredRenderableRunsIds} from '../main_view/common_selectors';

/**
 * SuperimposedCardIntegrated - A multi-tag card that integrates with the main card system.
 * This component renders multiple scalar tags on the same chart, using the main card system's
 * state management for sizing, viewBox, etc.
 */
@Component({
  standalone: false,
  selector: 'superimposed-card-integrated',
  template: `
    <superimposed-card-component
      [superimposedCardId]="cardId"
      [title]="title"
      [tags]="tags"
      [chartMetadataMap]="chartMetadataMap$ | async"
      [dataSeries]="dataSeries$ | async"
      [ignoreOutliers]="ignoreOutliers$ | async"
      [isCardVisible]="isVisible"
      [loadState]="loadState$ | async"
      [smoothingEnabled]="smoothingEnabled$ | async"
      [tooltipSort]="tooltipSort$ | async"
      [xAxisType]="xAxisType$ | async"
      [xScaleType]="xScaleType$ | async"
      [useDarkMode]="useDarkMode$ | async"
      [forceSvg]="forceSvg$ | async"
      [userViewBox]="userViewBox$ | async"
      (onViewBoxChange)="onUserViewBoxChanged($event)"
      (onDeleteCard)="onDeleteCard()"
      (onRemoveTag)="onRemoveTag($event)"
      (onFullWidthChanged)="onFullWidthChange($event)"
      (onFullHeightChanged)="onFullHeightChange($event)"
      observeIntersection
      (onVisibilityChange)="onVisibilityChange($event)"
    ></superimposed-card-component>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuperimposedCardIntegrated implements OnInit, OnDestroy {
  constructor(private readonly store: Store<State>) {
    this.useDarkMode$ = this.store.select(getDarkModeEnabled);
    this.ignoreOutliers$ = this.store.select(getMetricsIgnoreOutliers);
    this.tooltipSort$ = this.store.select(getMetricsTooltipSort);
    this.xAxisType$ = this.store.select(getMetricsXAxisType);
    this.forceSvg$ = this.store.select(getForceSvgFeatureFlag);
    this.xScaleType$ = this.store.select(getMetricsXAxisType).pipe(
      map((xAxisType) => {
        switch (xAxisType) {
          case XAxisType.STEP:
          case XAxisType.RELATIVE:
            return ScaleType.LINEAR;
          case XAxisType.WALL_TIME:
            return ScaleType.TIME;
          default:
            const neverType = xAxisType as never;
            throw new Error(`Invalid xAxisType for line chart. ${neverType}`);
        }
      })
    );
    this.scalarSmoothing$ = this.store.select(getMetricsScalarSmoothing);
    this.smoothingEnabled$ = this.store
      .select(getMetricsScalarSmoothing)
      .pipe(map((smoothing) => smoothing > 0));
  }

  @Input() cardId!: CardId;
  @Input() tags!: string[];
  @Input() title?: string;
  @Input() runColorScale?: RunColorScale;
  @Output() fullWidthChanged = new EventEmitter<boolean>();
  @Output() fullHeightChanged = new EventEmitter<boolean>();
  @Output() pinStateChanged = new EventEmitter<void>();

  isVisible = false;
  loadState$!: Observable<DataLoadState>;
  dataSeries$!: Observable<ScalarCardDataSeries[]>;
  chartMetadataMap$!: Observable<ScalarCardSeriesMetadataMap>;
  userViewBox$!: Observable<Extent | null>;

  onVisibilityChange({visible}: {visible: boolean}) {
    this.isVisible = visible;
  }

  readonly useDarkMode$: Observable<boolean>;
  readonly ignoreOutliers$: Observable<boolean>;
  readonly tooltipSort$;
  readonly xAxisType$: Observable<XAxisType>;
  readonly forceSvg$: Observable<boolean>;
  readonly xScaleType$: Observable<ScaleType>;
  readonly scalarSmoothing$: Observable<number>;
  readonly smoothingEnabled$: Observable<boolean>;

  private readonly ngUnsubscribe = new Subject<void>();

  ngOnInit() {
    // Get time series for all tags using the new selector
    const tagTimeSeries$ = this.store
      .select(getTimeSeriesForTags(this.tags))
      .pipe(shareReplay(1));

    // Get load state using the new selector
    this.loadState$ = this.store.select(getLoadStateForTags(this.tags));

    // Get card state for viewBox
    this.userViewBox$ = this.store.select(getCardStateMap).pipe(
      map((cardStateMap) => {
        const cardState = cardStateMap[this.cardId];
        return cardState?.userViewBox ?? null;
      })
    );

    // Convert time series to partial series format
    const partialSeries$ = combineLatest([
      tagTimeSeries$,
      this.store.select(getMetricsXAxisType),
    ]).pipe(
      map(([tagTimeSeries, xAxisType]) => {
        const results: PartialSeries[] = [];
        for (const tag of this.tags) {
          const runToSeries = tagTimeSeries[tag];
          if (!runToSeries) continue;

          const runIds = Object.keys(runToSeries);
          for (const runId of runIds) {
            results.push({
              runId: this.buildCombinedRunId(tag, runId),
              points: this.stepSeriesToLineSeries(
                runToSeries[runId] as ScalarStepDatum[],
                xAxisType
              ),
            });
          }
        }
        return results;
      }),
      shareReplay(1)
    );

    // Partition series for non-monotonic x handling
    const partitionedSeries$ = partialSeries$.pipe(
      combineLatestWith(
        this.store.select(getMetricsScalarPartitionNonMonotonicX)
      ),
      takeUntil(this.ngUnsubscribe),
      map<[PartialSeries[], boolean], PartitionedSeries[]>(
        ([normalizedSeries, enablePartition]) => {
          if (enablePartition) return partitionSeries(normalizedSeries);

          return normalizedSeries.map((series) => {
            return {
              ...series,
              seriesId: series.runId,
              partitionIndex: 0,
              partitionSize: 1,
            };
          });
        }
      ),
      map((partitionedSeriesList) => {
        return partitionedSeriesList.map((partitionedSeries) => {
          const firstWallTime = partitionedSeries.points[0]?.wallTime;
          return {
            ...partitionedSeries,
            points: partitionedSeries.points.map((point) => {
              return {
                ...point,
                relativeTimeInMs: point.wallTime - firstWallTime,
              };
            }),
          };
        });
      }),
      combineLatestWith(this.store.select(getMetricsXAxisType)),
      map(([partitionedSeriesList, xAxisType]) => {
        return partitionedSeriesList.map((series) => {
          return {
            ...series,
            points: series.points.map((point) => {
              let x: number;
              switch (xAxisType) {
                case XAxisType.RELATIVE:
                  x = point.relativeTimeInMs;
                  break;
                case XAxisType.WALL_TIME:
                  x = point.wallTime;
                  break;
                case XAxisType.STEP:
                default:
                  x = point.step;
              }
              return {...point, x};
            }),
          };
        });
      }),
      shareReplay(1)
    );

    // Build data series with smoothing
    function getSmoothedSeriesId(seriesId: string): string {
      return JSON.stringify(['smoothed', seriesId]);
    }

    this.dataSeries$ = partitionedSeries$.pipe(
      combineLatestWith(this.store.select(getMetricsScalarSmoothing)),
      switchMap<
        [PartitionedSeries[], number],
        Observable<ScalarCardDataSeries[]>
      >(([runsData, smoothing]) => {
        const cleanedRunsData = runsData.map(({seriesId, points}) => ({
          id: seriesId,
          points,
        }));
        if (smoothing <= 0) {
          return of(cleanedRunsData);
        }

        return from(
          classicSmoothing(cleanedRunsData, smoothing).then(
            (smoothedDataSeriesList) => {
              const smoothedList = cleanedRunsData.map((dataSeries, index) => {
                return {
                  id: getSmoothedSeriesId(dataSeries.id),
                  points: smoothedDataSeriesList[index].points.map(
                    ({y}, pointIndex) => {
                      return {...dataSeries.points[pointIndex], y};
                    }
                  ),
                };
              });
              return [...cleanedRunsData, ...smoothedList];
            }
          )
        );
      }),
      startWith([] as ScalarCardDataSeries[])
    );

    // Build chart metadata map
    this.chartMetadataMap$ = partitionedSeries$.pipe(
      switchMap<
        PartitionedSeries[],
        Observable<
          Array<
            PartitionedSeries & {
              displayName: string;
              alias: ExperimentAlias | null;
              tag: string;
              originalRunId: string;
            }
          >
        >
      >((partitioned) => {
        if (partitioned.length === 0) {
          return of([]);
        }
        return combineLatest(
          partitioned.map((series) => {
            const {tag, runId: originalRunId} = this.parseCombinedRunId(
              series.runId
            );
            return this.getRunDisplayNameAndAlias(originalRunId).pipe(
              map((displayNameAndAlias) => {
                return {
                  ...series,
                  ...displayNameAndAlias,
                  tag,
                  originalRunId,
                };
              })
            );
          })
        );
      }),
      combineLatestWith(
        this.store.select(getCurrentRouteRunSelection),
        this.store.select(getFilteredRenderableRunsIds),
        this.store.select(getRunColorMap),
        this.store.select(getMetricsScalarSmoothing)
      ),
      debounceTime(0),
      map(
        ([
          namedPartitionedSeries,
          runSelectionMap,
          renderableRuns,
          colorMap,
          smoothing,
        ]) => {
          const metadataMap: ScalarCardSeriesMetadataMap = {};
          const shouldSmooth = smoothing > 0;

          // Assign colors based on tag index
          const tagColors = new Map<string, string>();
          const baseColors = [
            '#1f77b4',
            '#ff7f0e',
            '#2ca02c',
            '#d62728',
            '#9467bd',
            '#8c564b',
            '#e377c2',
            '#7f7f7f',
            '#bcbd22',
            '#17becf',
          ];
          this.tags.forEach((tag, index) => {
            tagColors.set(tag, baseColors[index % baseColors.length]);
          });

          for (const partitioned of namedPartitionedSeries) {
            const {
              seriesId,
              displayName,
              alias,
              partitionIndex,
              partitionSize,
              tag,
              originalRunId,
            } = partitioned;

            const color =
              colorMap[originalRunId] ?? tagColors.get(tag) ?? '#fff';

            metadataMap[seriesId] = {
              type: SeriesType.ORIGINAL,
              id: seriesId,
              alias,
              displayName:
                partitionSize > 1
                  ? `[${tag}] ${displayName}: ${partitionIndex}`
                  : `[${tag}] ${displayName}`,
              visible: Boolean(
                runSelectionMap &&
                  runSelectionMap.get(originalRunId) &&
                  renderableRuns.has(originalRunId)
              ),
              color,
              aux: false,
              opacity: 1,
            };
          }

          if (!shouldSmooth) {
            return metadataMap;
          }

          for (const [id, metadata] of Object.entries(metadataMap)) {
            const smoothedSeriesId = getSmoothedSeriesId(id);
            metadataMap[smoothedSeriesId] = {
              ...metadata,
              id: smoothedSeriesId,
              type: SeriesType.DERIVED,
              aux: false,
              originalSeriesId: id,
            };

            metadata.aux = true;
            metadata.opacity = 0.25;
          }

          return metadataMap;
        }
      ),
      startWith({} as ScalarCardSeriesMetadataMap)
    );
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private getRunDisplayNameAndAlias(
    runId: string
  ): Observable<{displayName: string; alias: ExperimentAlias | null}> {
    return combineLatest([
      this.store.select(getExperimentIdForRunId, {runId}),
      this.store.select(getExperimentIdToExperimentAliasMap),
      this.store.select(getRun, {runId}),
    ]).pipe(
      map(([experimentId, idToAlias, run]) => {
        const alias =
          experimentId !== null ? idToAlias[experimentId] ?? null : null;
        return {
          displayName: !run && !alias ? runId : run?.name ?? '...',
          alias: alias,
        };
      })
    );
  }

  private buildCombinedRunId(tag: string, runId: string): string {
    return JSON.stringify([tag, runId]);
  }

  private parseCombinedRunId(combinedRunId: string): {
    tag: string;
    runId: string;
  } {
    const [tag, runId] = JSON.parse(combinedRunId) as [string, string];
    return {tag, runId};
  }

  private stepSeriesToLineSeries(
    stepSeries: ScalarStepDatum[],
    xAxisType: XAxisType
  ): ScalarCardPoint[] {
    const isStepBased = xAxisType === XAxisType.STEP;
    return stepSeries.map((stepDatum) => {
      const wallTime = stepDatum.wallTime * 1000;
      return {
        ...stepDatum,
        x: isStepBased ? stepDatum.step : wallTime,
        y: stepDatum.value,
        wallTime,
        relativeTimeInMs: 0,
      };
    });
  }

  onDeleteCard() {
    this.store.dispatch(
      actions.superimposedCardDeleted({
        superimposedCardId: this.cardId,
      })
    );
    this.pinStateChanged.emit();
  }

  onRemoveTag(tag: string) {
    this.store.dispatch(
      actions.superimposedCardTagRemoved({
        superimposedCardId: this.cardId,
        tag,
      })
    );
  }

  onFullWidthChange(fullWidth: boolean) {
    this.fullWidthChanged.emit(fullWidth);
  }

  onFullHeightChange(fullHeight: boolean) {
    this.fullHeightChanged.emit(fullHeight);
  }

  onUserViewBoxChanged(viewBox: Extent | null) {
    this.store.dispatch(
      actions.cardViewBoxChanged({
        cardId: this.cardId,
        userViewBox: viewBox,
      })
    );
  }
}
