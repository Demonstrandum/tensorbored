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
import {Injectable} from '@angular/core';
import {CardUniqueInfo} from '../types';
import {Tag} from './types';

/**
 * Legacy key for scalar-only pins (tag strings only).
 * Kept for backwards compatibility during migration.
 */
const SAVED_SCALAR_PINS_KEY = 'tb-saved-scalar-pins';

/**
 * New key for all pinned cards stored as full CardUniqueInfo objects.
 * This removes the URL length limitation and supports all plugin types.
 */
const SAVED_PINS_KEY = 'tb-saved-pins';

/**
 * Checks if two CardUniqueInfo objects refer to the same card.
 */
function cardInfoEquals(a: CardUniqueInfo, b: CardUniqueInfo): boolean {
  return (
    a.plugin === b.plugin &&
    a.tag === b.tag &&
    a.runId === b.runId &&
    a.sample === b.sample
  );
}

@Injectable()
export class SavedPinsDataSource {
  /**
   * Legacy method for scalar pins (tags only).
   * @deprecated Use savePin() with CardUniqueInfo instead.
   */
  saveScalarPin(tag: Tag): void {
    const existingPins = this.getSavedScalarPins();
    if (!existingPins.includes(tag)) {
      existingPins.push(tag);
    }
    window.localStorage.setItem(
      SAVED_SCALAR_PINS_KEY,
      JSON.stringify(existingPins)
    );
  }

  /**
   * Legacy method for scalar pins (tags only).
   * @deprecated Use savePins() with CardUniqueInfo[] instead.
   */
  saveScalarPins(tags: Tag[]): void {
    const existingPins = this.getSavedScalarPins();
    const newTags = tags.filter((v) => !existingPins.includes(v));
    existingPins.push(...newTags);
    window.localStorage.setItem(
      SAVED_SCALAR_PINS_KEY,
      JSON.stringify(existingPins)
    );
  }

  /**
   * Legacy method for scalar pins (tags only).
   * @deprecated Use removePin() with CardUniqueInfo instead.
   */
  removeScalarPin(tag: Tag): void {
    const existingPins = this.getSavedScalarPins();
    window.localStorage.setItem(
      SAVED_SCALAR_PINS_KEY,
      JSON.stringify(existingPins.filter((pin) => pin !== tag))
    );
  }

  /**
   * Legacy method for scalar pins (tags only).
   * @deprecated Use getSavedPins() instead.
   */
  getSavedScalarPins(): Tag[] {
    const savedPins = window.localStorage.getItem(SAVED_SCALAR_PINS_KEY);
    if (savedPins) {
      return JSON.parse(savedPins) as Tag[];
    }
    return [];
  }

  /**
   * Legacy method for scalar pins (tags only).
   * @deprecated Use removeAllPins() instead.
   */
  removeAllScalarPins(): void {
    window.localStorage.setItem(SAVED_SCALAR_PINS_KEY, JSON.stringify([]));
  }

  // ============================================================================
  // New methods for full CardUniqueInfo storage (no URL length limitations)
  // ============================================================================

  /**
   * Saves a single pin to localStorage.
   * Supports all plugin types (scalars, histograms, images).
   */
  savePin(cardInfo: CardUniqueInfo): void {
    const existingPins = this.getSavedPins();
    const alreadyExists = existingPins.some((pin) =>
      cardInfoEquals(pin, cardInfo)
    );
    if (!alreadyExists) {
      existingPins.push(cardInfo);
      window.localStorage.setItem(SAVED_PINS_KEY, JSON.stringify(existingPins));
    }
  }

  /**
   * Saves multiple pins to localStorage.
   * Supports all plugin types (scalars, histograms, images).
   */
  savePins(cardInfos: CardUniqueInfo[]): void {
    const existingPins = this.getSavedPins();
    const newPins = cardInfos.filter(
      (cardInfo) =>
        !existingPins.some((existing) => cardInfoEquals(existing, cardInfo))
    );
    if (newPins.length > 0) {
      existingPins.push(...newPins);
      window.localStorage.setItem(SAVED_PINS_KEY, JSON.stringify(existingPins));
    }
  }

  /**
   * Removes a single pin from localStorage.
   */
  removePin(cardInfo: CardUniqueInfo): void {
    const existingPins = this.getSavedPins();
    const filteredPins = existingPins.filter(
      (pin) => !cardInfoEquals(pin, cardInfo)
    );
    window.localStorage.setItem(SAVED_PINS_KEY, JSON.stringify(filteredPins));
  }

  /**
   * Retrieves all saved pins from localStorage.
   * Returns full CardUniqueInfo objects for all plugin types.
   */
  getSavedPins(): CardUniqueInfo[] {
    const savedPins = window.localStorage.getItem(SAVED_PINS_KEY);
    if (savedPins) {
      try {
        const parsed = JSON.parse(savedPins);
        if (Array.isArray(parsed)) {
          return parsed as CardUniqueInfo[];
        }
      } catch {
        // Invalid JSON, return empty array
      }
    }
    return [];
  }

  /**
   * Replaces all saved pins with the given list.
   * This is useful for syncing with the current state.
   */
  setSavedPins(cardInfos: CardUniqueInfo[]): void {
    window.localStorage.setItem(SAVED_PINS_KEY, JSON.stringify(cardInfos));
  }

  /**
   * Removes all saved pins from localStorage.
   */
  removeAllPins(): void {
    window.localStorage.setItem(SAVED_PINS_KEY, JSON.stringify([]));
  }

  /**
   * Migrates legacy scalar-only pins to the new full CardUniqueInfo format.
   * Should be called once on initialization.
   */
  migrateLegacyPins(): void {
    const legacyPins = this.getSavedScalarPins();
    if (legacyPins.length === 0) {
      return;
    }

    const existingNewPins = this.getSavedPins();
    const migratedPins: CardUniqueInfo[] = legacyPins.map((tag) => ({
      plugin: 'scalars',
      tag: tag,
    }));

    // Merge migrated pins with existing new-format pins (avoid duplicates)
    const newPinsToAdd = migratedPins.filter(
      (migrated) =>
        !existingNewPins.some((existing) => cardInfoEquals(existing, migrated))
    );

    if (newPinsToAdd.length > 0) {
      existingNewPins.push(...newPinsToAdd);
      window.localStorage.setItem(
        SAVED_PINS_KEY,
        JSON.stringify(existingNewPins)
      );
    }

    // Clear legacy storage after migration
    this.removeAllScalarPins();
  }
}
