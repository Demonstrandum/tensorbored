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
import {TimeSelection} from '../widgets/card_fob/card_fob_types';
import {HistogramMode} from '../widgets/histogram/histogram_types';
import {
  ColumnHeader,
  DataTableMode,
  ReorderColumnEvent,
} from '../widgets/data_table/types';

export {HistogramMode, TimeSelection};

export enum PluginType {
  SCALARS = 'scalars',
  HISTOGRAMS = 'histograms',
  IMAGES = 'images',
}

export enum XAxisType {
  STEP = 'step',
  RELATIVE = 'relative',
  WALL_TIME = 'walltime',
}

export interface CardMetadata {
  plugin: PluginType;
  tag: string;
  /**
   * For superimposed cards, multiple tags can be displayed on the same plot.
   * When tags has multiple entries, this is a superimposed card.
   */
  tags?: string[];
  /**
   * Title for the card. Used mainly for superimposed cards.
   */
  title?: string;
  sample?: number;
  numSample?: number;

  /**
   * A `null` runId indicates all runs.
   */
  runId: string | null;
}

/**
 * Returns true if the card metadata represents a superimposed (multi-tag) card.
 */
export function isSuperimposedCard(metadata: CardMetadata): boolean {
  return Boolean(metadata.tags && metadata.tags.length > 1);
}

/**
 * Identifier for a card which, itself, is not a pinned copy of another card.
 * Views may treat a non-pinned card as having "truthy pin state" if another
 * `PinnedCardId` is associated to it.
 */
export type NonPinnedCardId = string;

export type PinnedCardId = string;

/**
 * A unique identifier to a specific card instance in the UI. This is an opaque
 * ID, meaning that consumers should never peer into/parse it and never assume
 * that it will always be a string.
 */
export type CardId = NonPinnedCardId | PinnedCardId;

export type CardIdWithMetadata = CardMetadata & {
  cardId: CardId;
};

export interface CardGroup {
  groupName: string;
  items: CardIdWithMetadata[];
}

/**
 * The most minimal representation of a card that uniquely identifies it across
 * a browser session. This information may be persisted in storage, retrieved,
 * and used to match against an existing card with the same metadata.
 */
export interface CardUniqueInfo {
  plugin: string;
  tag: string;
  /**
   * For superimposed cards, multiple tags on the same plot.
   */
  tags?: string[];
  /**
   * Title for superimposed cards.
   */
  title?: string;
  runId?: string;
  sample?: number;
}

/**
 * The metrics-related state created by deserializing a URL.
 */
export interface URLDeserializedState {
  metrics: {
    pinnedCards: CardUniqueInfo[];
    smoothing: number | null;
    tagFilter: string | null;
  };
}

export interface HeaderEditInfo extends ReorderColumnEvent {
  dataTableMode: DataTableMode;
}

export interface HeaderToggleInfo {
  header: ColumnHeader;
  cardId?: CardId;
  dataTableMode?: DataTableMode | undefined;
}

export const SCALARS_SMOOTHING_MIN = 0;
export const SCALARS_SMOOTHING_MAX = 0.999;

/**
 * Identifier for a superimposed card that combines multiple tags.
 */
export type SuperimposedCardId = string;

/**
 * Metadata for a superimposed card containing multiple scalar tags on the same plot.
 */
export interface SuperimposedCardMetadata {
  /**
   * Unique identifier for the superimposed card.
   */
  id: SuperimposedCardId;

  /**
   * User-defined title for the superimposed card.
   */
  title: string;

  /**
   * List of tags to display together. All tags must be scalar tags.
   */
  tags: string[];

  /**
   * Optional runId filter. If null, all runs are shown.
   */
  runId: string | null;
}
